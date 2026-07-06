package com.shopacc.backend.controller;

import com.shopacc.backend.entity.Service;
import com.shopacc.backend.entity.ServiceOrder;
import com.shopacc.backend.entity.User;
import com.shopacc.backend.entity.UserBalanceLog;
import com.shopacc.backend.repository.ServiceRepository;
import com.shopacc.backend.repository.ServiceOrderRepository;
import com.shopacc.backend.repository.UserRepository;
import com.shopacc.backend.repository.UserBalanceLogRepository;
import com.shopacc.backend.security.CustomUserDetails;
import com.shopacc.backend.service.CryptoService;
import com.shopacc.backend.service.CacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceRepository serviceRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final UserRepository userRepository;
    private final UserBalanceLogRepository balanceLogRepository;
    private final CryptoService cryptoService;
    private final CacheService cacheService;

    @Value("${SUPABASE_URL}")
    private String supabaseUrl;

    @Value("${SUPABASE_SERVICE_ROLE_KEY}")
    private String serviceRoleKey;

    @Value("${SUPABASE_BUCKET}")
    private String bucket;

    private final WebClient webClient = WebClient.create();

    // ==================== PUBLIC ====================

    @GetMapping
    public List<Service> getAllServices(@RequestParam(required = false) String game) {
        String key = game != null ? "services:game:" + game : "services:all";
        return cacheService.getOrSet(key,
                new com.fasterxml.jackson.core.type.TypeReference<List<Service>>() {},
                () -> {
                    if (game != null && !game.isBlank()) {
                        return serviceRepository.findByGameNameAndIsActiveTrueOrderByCreatedAtDesc(game);
                    }
                    return serviceRepository.findAllByOrderByCreatedAtDesc();
                });
    }

    @GetMapping("/games")
    public List<String> getServiceGames() {
        return cacheService.getOrSet("services:games",
                new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {},
                () -> {
                    List<Service> all = serviceRepository.findAllByOrderByCreatedAtDesc();
                    return all.stream()
                            .filter(Service::isActive)
                            .map(Service::getGameName)
                            .distinct()
                            .toList();
                });
    }

    @GetMapping("/{id}")
    public Service getService(@PathVariable Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));
    }

    // ==================== USER ====================

    @PostMapping("/{id}/order")
    @Transactional
    public Map<String, Object> createOrder(
                    @AuthenticationPrincipal CustomUserDetails userDetails,
                    @PathVariable Long id,
                    @RequestBody Map<String, String> body) {

        Service svc = serviceRepository.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));

        User user = userRepository.findById(userDetails.getId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        BigDecimal price = svc.getPrice();
        if (user.getBalance().compareTo(price) < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient balance");
        }

        // Encrypt sensitive data
        String accountName = cryptoService.encrypt(body.getOrDefault("accountName", ""));
        String password = cryptoService.encrypt(body.getOrDefault("password", ""));

        // Deduct balance
        BigDecimal before = user.getBalance();
        BigDecimal after = before.subtract(price);
        user.setBalance(after);
        userRepository.save(user);

        // Create order
        ServiceOrder order = ServiceOrder.builder()
                        .userId(userDetails.getId())
                        .serviceId(svc.getId())
                        .serviceTitle(svc.getTitle())
                        .price(price)
                        .accountName(accountName)
                        .password(password)
                        .server(body.getOrDefault("server", ""))
                        .note(body.getOrDefault("note", ""))
                        .status("PENDING")
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
        serviceOrderRepository.save(order);

        // Balance log
        UserBalanceLog log = UserBalanceLog.builder()
                        .user(user)
                        .amountBefore(before)
                        .amountChange(price.negate())
                        .amountAfter(after)
                        .type("SERVICE")
                        .description("Order service: " + svc.getTitle())
                        .build();
        balanceLogRepository.save(log);

        return Map.of(
                        "success", true,
                        "orderId", order.getId(),
                        "message", "Đã tạo đơn dịch vụ thành công");
    }

    @GetMapping("/my-orders")
    public List<Map<String, Object>> getMyOrders(
                    @AuthenticationPrincipal CustomUserDetails userDetails) {
        return serviceOrderRepository.findByUserIdOrderByCreatedAtDesc(userDetails.getId())
                        .stream()
                        .map(this::mapOrder)
                        .toList();
    }

    // ==================== ADMIN ====================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Service createService(@RequestBody Service svc) {
        svc.setCreatedAt(LocalDateTime.now());
        svc.setUpdatedAt(LocalDateTime.now());
        Service saved = serviceRepository.save(svc);
        cacheService.evict("services:all", "services:game:" + svc.getGameName(), "services:games");
        return saved;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Service updateService(@PathVariable Long id, @RequestBody Service update) {
        Service svc = serviceRepository.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (update.getTitle() != null) svc.setTitle(update.getTitle());
        if (update.getSlug() != null) svc.setSlug(update.getSlug());
        if (update.getDescription() != null) svc.setDescription(update.getDescription());
        if (update.getPrice() != null) svc.setPrice(update.getPrice());
        if (update.getThumbnail() != null) svc.setThumbnail(update.getThumbnail());
        if (update.getServerName() != null) svc.setServerName(update.getServerName());
        if (update.getGameName() != null) svc.setGameName(update.getGameName());
        svc.setActive(update.isActive());
        svc.setUpdatedAt(LocalDateTime.now());
        Service saved = serviceRepository.save(svc);
        cacheService.evict("services:all", "services:game:" + svc.getGameName(), "services:games");
        return saved;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> deleteService(@PathVariable Long id) {
        Service svc = serviceRepository.findById(id).orElse(null);
        if (svc != null) cacheService.evict("services:all", "services:game:" + svc.getGameName(), "services:games");
        serviceRepository.deleteById(id);
        return Map.of("message", "Service deleted");
    }

    @GetMapping("/admin/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Map<String, Object>> getAllOrders() {
        return serviceOrderRepository.findAllByOrderByCreatedAtDesc()
                        .stream()
                        .map(this::mapOrderAdmin)
                        .toList();
    }

    @PatchMapping("/admin/orders/{id}/process")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> processOrder(@PathVariable Long id) {
        ServiceOrder order = serviceOrderRepository.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!"PENDING".equals(order.getStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order not in PENDING status");
        }
        order.setStatus("PROCESSING");
        order.setUpdatedAt(LocalDateTime.now());
        serviceOrderRepository.save(order);
        return mapOrderAdmin(order);
    }

    @PatchMapping("/admin/orders/{id}/complete")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> completeOrder(@PathVariable Long id) {
        ServiceOrder order = serviceOrderRepository.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        order.setStatus("COMPLETED");
        order.setUpdatedAt(LocalDateTime.now());
        serviceOrderRepository.save(order);
        return mapOrderAdmin(order);
    }

    @PatchMapping("/admin/orders/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public Map<String, Object> cancelOrder(@PathVariable Long id) {
        ServiceOrder order = serviceOrderRepository.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if ("COMPLETED".equals(order.getStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot cancel completed order");
        }

        // Refund
        User user = userRepository.findById(order.getUserId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        BigDecimal before = user.getBalance();
        BigDecimal after = before.add(order.getPrice());
        user.setBalance(after);
        userRepository.save(user);

        order.setStatus("CANCELLED");
        order.setUpdatedAt(LocalDateTime.now());
        serviceOrderRepository.save(order);

        UserBalanceLog log = UserBalanceLog.builder()
                        .user(user)
                        .amountBefore(before)
                        .amountChange(order.getPrice())
                        .amountAfter(after)
                        .type("REFUND")
                        .description("Cancel service order #" + order.getId())
                        .build();
        balanceLogRepository.save(log);

        return mapOrderAdmin(order);
    }

    @PostMapping("/{id}/upload-image")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> uploadImage(
                    @PathVariable Long id,
                    @RequestParam("file") MultipartFile file) {

        Service svc = serviceRepository.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        try {
            String fileName = "services/" + id + "_" + System.currentTimeMillis() + ".jpg";

            String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + fileName;
            webClient.post()
                            .uri(uploadUrl)
                            .header("Authorization", "Bearer " + serviceRoleKey)
                            .contentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM)
                            .body(Mono.just(file.getBytes()), byte[].class)
                            .retrieve()
                            .bodyToMono(String.class)
                            .block();

            String publicUrl = supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + fileName;
            svc.setThumbnail(publicUrl);
            svc.setUpdatedAt(LocalDateTime.now());
            serviceRepository.save(svc);

            return Map.of("url", publicUrl);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Upload failed");
        }
    }

    // ==================== MAPPERS ====================

    private Map<String, Object> mapOrder(ServiceOrder o) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", o.getId());
        m.put("serviceId", o.getServiceId());
        m.put("serviceTitle", o.getServiceTitle());
        m.put("price", o.getPrice());
        m.put("server", o.getServer());
        m.put("note", o.getNote());
        m.put("status", o.getStatus());
        m.put("createdAt", o.getCreatedAt());
        m.put("updatedAt", o.getUpdatedAt());
        return m;
    }

    private Map<String, Object> mapOrderAdmin(ServiceOrder o) {
        Map<String, Object> m = mapOrder(o);
        m.put("userId", o.getUserId());
        m.put("accountName", cryptoService.decrypt(o.getAccountName()));
        m.put("password", cryptoService.decrypt(o.getPassword()));
        return m;
    }
}
