package com.shopacc.backend.controller;

import com.shopacc.backend.dto.order.OrderResponse;
import com.shopacc.backend.dto.admin.*;
import com.shopacc.backend.dto.admin.AdjustBalanceRequest;
import com.shopacc.backend.dto.listing.CreateListingRequest;
import com.shopacc.backend.dto.listing.ListingResponse;
import com.shopacc.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.shopacc.backend.dto.user.*;
import com.shopacc.backend.enums.ListingStatus;
import com.shopacc.backend.enums.ListingType;
import com.shopacc.backend.service.PaymentService;
import jakarta.validation.Valid;
import com.shopacc.backend.enums.AuditAction;
import com.shopacc.backend.security.CustomUserDetails;
import com.shopacc.backend.service.AuditLogService;
import com.shopacc.backend.repository.PaymentWebhookLogRepository;
import com.shopacc.backend.entity.PaymentWebhookLog;
import com.shopacc.backend.entity.DiscountCode;
import com.shopacc.backend.entity.Listing;
import com.shopacc.backend.entity.ServiceOrder;
import com.shopacc.backend.repository.DiscountCodeRepository;
import com.shopacc.backend.repository.ListingRepository;
import com.shopacc.backend.repository.ServiceOrderRepository;
import com.shopacc.backend.service.CacheService;
import com.shopacc.backend.service.CryptoService;
import org.springframework.data.domain.Sort;
import lombok.extern.slf4j.Slf4j;
import jakarta.servlet.http.HttpServletRequest;
import com.shopacc.backend.dto.common.SecretResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

        private final AdminService adminService;

        private final PaymentService paymentService;

        private final AuditLogService auditLogService;

        private final PaymentWebhookLogRepository webhookLogRepository;

        private final DiscountCodeRepository discountCodeRepository;

        private final CacheService cacheService;

        private final ListingRepository listingRepository;
        private final ServiceOrderRepository serviceOrderRepository;
        private final CryptoService cryptoService;

        @GetMapping("/categories")
        public List<CategoryResponse> getAllCategories() {
                return cacheService.getOrSet("categories:all",
                                new com.fasterxml.jackson.core.type.TypeReference<List<CategoryResponse>>() {},
                                () -> adminService.getAllCategories());
        }

        @GetMapping("/categories/{id}")
        public AdminCategoryDetailResponse getCategoryDetail(
                        @PathVariable Long id) {
                return adminService.getCategoryDetail(id);
        }

        @PostMapping("/categories")
        public CategoryResponse createCategory(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @Valid @RequestBody CreateCategoryRequest request,
                        HttpServletRequest httpRequest) {
                CategoryResponse category = adminService.createCategory(request);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_CREATE_CATEGORY,
                                "categoryId=" + category.getId(),
                                httpRequest);

                cacheService.evict("categories:all");
                return category;
        }

        @PutMapping("/categories/{id}")
        public CategoryResponse updateCategory(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        @Valid @RequestBody UpdateCategoryRequest request,
                        HttpServletRequest httpRequest) {
                CategoryResponse category = adminService.updateCategory(id, request);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_UPDATE_CATEGORY,
                                "categoryId=" + id,
                                httpRequest);

                cacheService.evict("categories:all");
                return category;
        }

        @DeleteMapping("/categories/{id}")
        public Map<String, String> deleteCategory(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        HttpServletRequest httpRequest) {
                adminService.deleteCategory(id);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_DELETE_CATEGORY,
                                "categoryId=" + id,
                                httpRequest);

                cacheService.evict("categories:all");
                return Map.of("message", "Category deleted successfully");
        }

        @GetMapping("/listings/{id:\\d+}")
        public AdminListingDetailResponse getListingDetail(
                        @PathVariable Long id) {
                return adminService.getListingDetail(id);
        }

        @GetMapping("/listings")
        public List<ListingResponse> getAllListings() {

                return adminService.getAllListings();
        }

        @PutMapping("/listings/{id}")
        public ListingResponse updateListing(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        @Valid @RequestBody UpdateListingRequest request,
                        HttpServletRequest httpRequest) {

                ListingResponse response = adminService.updateListing(id, request);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_UPDATE_LISTING,
                                "listingId=" + id,
                                httpRequest);

                return response;
        }

        @PatchMapping("/listings/{id}/status")
        public ListingResponse updateListingStatus(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        @Valid @RequestBody UpdateListingStatusRequest request,
                        HttpServletRequest httpRequest) {

                ListingResponse response = adminService.updateListingStatus(id, request);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_UPDATE_LISTING_STATUS,
                                "listingId=" + id + ", status=" + request.getStatus(),
                                httpRequest);

                return response;
        }

        @PatchMapping("/listings/{id}/featured")
        public ListingResponse updateListingFeatured(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        @Valid @RequestBody UpdateFeaturedRequest request,
                        HttpServletRequest httpRequest) {

                ListingResponse response = adminService.updateListingFeatured(id, request);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_UPDATE_LISTING_FEATURED,
                                "listingId=" + id + ", featured=" + request.getFeatured(),
                                httpRequest);

                return response;
        }

        @DeleteMapping("/listings/{id}")
        public Map<String, String> deleteListing(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        HttpServletRequest httpRequest) {

                adminService.deleteListing(id);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_DELETE_LISTING,
                                "listingId=" + id,
                                httpRequest);

                return Map.of("message", "Listing deleted successfully");
        }

        @GetMapping("/orders")
        public List<OrderResponse> getAllOrders() {
                adminService.cancelExpiredPendingOrders();

                return adminService.getAllOrders();
        }

        @GetMapping("/orders/{orderId}")
        public OrderResponse getOrderDetail(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long orderId,
                        HttpServletRequest httpRequest) {
                OrderResponse response = adminService.getOrderDetail(orderId);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_VIEW_ORDER_DETAIL,
                                "orderId=" + orderId,
                                httpRequest);

                return response;
        }

        @PatchMapping("/orders/{orderId}/refund")
        public OrderResponse refundOrder(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long orderId,
                        HttpServletRequest httpRequest) {
                OrderResponse response = adminService.refundOrder(orderId);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_REFUND_ORDER,
                                "orderId=" + orderId,
                                httpRequest);

                return response;
        }

        @GetMapping("/users")
        public List<UserResponse> getAllUsers() {

                return adminService.getAllUsers();
        }

        @GetMapping("/users/{id}")
        public AdminUserDetailResponse getUserDetail(
                        @PathVariable Long id) {
                return adminService.getUserDetail(id);
        }

        @PostMapping("/users/{id}/adjust-balance")
        public UserResponse adjustUserBalance(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        @Valid @RequestBody AdjustBalanceRequest request,
                        HttpServletRequest httpRequest) {
                UserResponse response = adminService.adjustUserBalance(id, request);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_ADJUST_BALANCE,
                                "targetUserId=" + id + ", amount=" + request.getAmount(),
                                httpRequest);

                return response;
        }

        @PostMapping("/users/{id}/reset-password")
        public ResetPasswordResponse resetUserPassword(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        HttpServletRequest httpRequest) {
                ResetPasswordResponse response = adminService.resetUserPassword(id);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_RESET_USER_PASSWORD,
                                "targetUserId=" + id,
                                httpRequest);

                return response;
        }

        @PatchMapping("/users/{id}/status")
        public UserResponse updateUserStatus(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        @Valid @RequestBody UpdateUserStatusRequest request,
                        HttpServletRequest httpRequest) {
                UserResponse response = adminService.updateUserStatus(id, request);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_UPDATE_USER_STATUS,
                                "targetUserId=" + id + ", status=" + request.getStatus(),
                                httpRequest);

                return response;
        }

        @GetMapping("/users/{id}/transactions")
        public List<TransactionResponse> getUserTransactions(
                        @PathVariable Long id) {

                return adminService.getUserTransactions(id);
        }

        @DeleteMapping("/listings/images/{imageId}")
        public Map<String, String> deleteListingImage(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long imageId,
                        HttpServletRequest httpRequest) {

                adminService.deleteListingImage(imageId);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_DELETE_LISTING_IMAGE,
                                "imageId=" + imageId,
                                httpRequest);

                return Map.of(
                                "message",
                                "Listing image deleted successfully");
        }

        @PatchMapping("/listings/{id}/thumbnail")
        public ListingResponse updateThumbnail(
                        @PathVariable Long id,
                        @Valid @RequestBody UpdateThumbnailRequest request) {

                return adminService.updateThumbnail(
                                id,
                                request);
        }

        @GetMapping("/listings/filter")
        public List<ListingResponse> filterListings(
                        @RequestParam(required = false) ListingStatus status,
                        @RequestParam(required = false) Long categoryId,
                        @RequestParam(required = false) ListingType listingType,
                        @RequestParam(required = false) String gameName) {
                return adminService.filterListings(status, categoryId, listingType, gameName);
        }

        @GetMapping("/transactions")
        public List<TransactionResponse> getAllTransactions() {

                return paymentService.getAllTransactionsForAdmin();
        }

        @PatchMapping("/transactions/{id}/approve")
        public TransactionResponse approveTransaction(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        HttpServletRequest httpRequest) {

                TransactionResponse response = paymentService.approveTransaction(id);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_APPROVE_TRANSACTION,
                                "transactionId=" + id,
                                httpRequest);

                return response;
        }

        @PatchMapping("/transactions/{id}/reject")
        public TransactionResponse rejectTransaction(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        HttpServletRequest httpRequest) {

                TransactionResponse response = paymentService.rejectTransaction(id);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_REJECT_TRANSACTION,
                                "transactionId=" + id,
                                httpRequest);

                return response;
        }

        @GetMapping("/webhook-logs")
        public List<PaymentWebhookLog> getWebhookLogs() {
                try {
                        log.info("[ADMIN] Fetching webhook logs...");
                        List<PaymentWebhookLog> logs = webhookLogRepository.findAllByOrderByCreatedAtDesc();
                        log.info("[ADMIN] Webhook logs fetched: {} records", logs.size());
                        return logs;
                } catch (Exception e) {
                        log.error("[ADMIN] Failed to fetch webhook logs", e);
                        throw e;
                }
        }

        @GetMapping("/dashboard")
        public AdminDashboardResponse dashboard(
                        @AuthenticationPrincipal CustomUserDetails userDetails) {
                return adminService.getDashboard(userDetails);
        }

        @PostMapping("/listings")
        public ListingResponse createListing(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @Valid @RequestBody CreateListingRequest request,
                        HttpServletRequest httpRequest) {
                ListingResponse response = adminService.createListing(request);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_CREATE_LISTING,
                                "listingId=" + response.getId(),
                                httpRequest);

                return response;
        }

        @GetMapping("/audit-logs")
        public List<AuditLogResponse> getAuditLogs() {
                return adminService.getAuditLogs();
        }

        @GetMapping("/listings/{id}/secret")
        public SecretResponse viewListingSecret(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        HttpServletRequest httpRequest) {
                String secretData = adminService.getListingSecret(id);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_VIEW_LISTING_SECRET,
                                "listingId=" + id,
                                httpRequest);

                return new SecretResponse(secretData);
        }

        // ===================== DISCOUNT CODES =====================
        @GetMapping("/discounts")
        public List<DiscountCode> getAllDiscounts() {
                return discountCodeRepository.findAll();
        }

        @PostMapping("/discounts")
        public DiscountCode createDiscount(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @RequestBody DiscountCode discount,
                        HttpServletRequest httpRequest) {
                discount.setUsedCount(0);
                discount.setCreatedAt(java.time.LocalDateTime.now());
                if (discount.getCode() == null) discount.setCode(userDetails.getUsername() + "_" + System.currentTimeMillis() / 1000);
                DiscountCode saved = discountCodeRepository.save(discount);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_CREATE_LISTING,
                                "Created discount code " + saved.getCode(),
                                httpRequest);

                return saved;
        }

        @PatchMapping("/discounts/{id}")
        public DiscountCode updateDiscount(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        @RequestBody DiscountCode update,
                        HttpServletRequest httpRequest) {
                DiscountCode discount = discountCodeRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Discount not found"));
                if (update.getCode() != null) discount.setCode(update.getCode());
                if (update.getType() != null) discount.setType(update.getType());
                if (update.getValue() != null) discount.setValue(update.getValue());
                if (update.getMinOrderAmount() != null) discount.setMinOrderAmount(update.getMinOrderAmount());
                if (update.getMaxUsage() != null) discount.setMaxUsage(update.getMaxUsage());
                discount.setActive(update.isActive());
                if (update.getExpiresAt() != null) discount.setExpiresAt(update.getExpiresAt());

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_UPDATE_LISTING,
                                "Updated discount code " + discount.getCode(),
                                httpRequest);

                return discountCodeRepository.save(discount);
        }

        @DeleteMapping("/discounts/{id}")
        public Map<String, String> deleteDiscount(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long id,
                        HttpServletRequest httpRequest) {
                discountCodeRepository.deleteById(id);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.ADMIN_DELETE_LISTING,
                                "Deleted discount code id=" + id,
                                httpRequest);

                return Map.of("message", "Discount deleted");
        }

        @PostMapping("/migrate-aes-key")
        public Map<String, Object> migrateAesKey(@RequestBody Map<String, String> body) {
                String oldKey = body.get("oldKey");
                if (oldKey == null || oldKey.isBlank()) {
                        return Map.of("success", false, "message", "Missing oldKey");
                }

                int migrated = 0;
                int failed = 0;

                // Migrate listings
                List<com.shopacc.backend.entity.Listing> listings = listingRepository.findAll();
                for (com.shopacc.backend.entity.Listing l : listings) {
                        if (l.getSecretDataEncrypted() != null && !l.getSecretDataEncrypted().isBlank()) {
                                try {
                                        String plain = cryptoService.decryptWithKey(l.getSecretDataEncrypted(), oldKey);
                                        l.setSecretDataEncrypted(cryptoService.encrypt(plain));
                                        listingRepository.save(l);
                                        migrated++;
                                } catch (Exception e) {
                                        failed++;
                                }
                        }
                }

                // Migrate service orders
                List<com.shopacc.backend.entity.ServiceOrder> svcOrders = serviceOrderRepository.findAll();
                for (com.shopacc.backend.entity.ServiceOrder so : svcOrders) {
                        boolean changed = false;
                        if (so.getAccountName() != null && !so.getAccountName().isBlank()) {
                                try {
                                        so.setAccountName(cryptoService.encrypt(
                                                cryptoService.decryptWithKey(so.getAccountName(), oldKey)));
                                        changed = true;
                                } catch (Exception ignored) {}
                        }
                        if (so.getPassword() != null && !so.getPassword().isBlank()) {
                                try {
                                        so.setPassword(cryptoService.encrypt(
                                                cryptoService.decryptWithKey(so.getPassword(), oldKey)));
                                        changed = true;
                                } catch (Exception ignored) {}
                        }
                        if (changed) {
                                serviceOrderRepository.save(so);
                                migrated++;
                        }
                }

                return Map.of("success", true, "migrated", migrated, "failed", failed,
                        "message", "AES key migration completed. " + migrated + " records migrated, " + failed + " failed.");
        }
}