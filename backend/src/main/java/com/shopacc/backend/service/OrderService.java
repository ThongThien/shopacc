package com.shopacc.backend.service;

import com.shopacc.backend.dto.order.CreateOrderPreviewResponse;
import com.shopacc.backend.dto.order.OrderItemResponse;
import com.shopacc.backend.dto.order.OrderResponse;
import com.shopacc.backend.dto.order.OrderSecretResponse;
import com.shopacc.backend.dto.order.PurchaseResponse;
import com.shopacc.backend.entity.*;
import com.shopacc.backend.enums.ListingStatus;
import com.shopacc.backend.enums.OrderStatus;
import com.shopacc.backend.enums.PaymentStatus;
import com.shopacc.backend.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

        private final ListingRepository listingRepository;
        private final UserRepository userRepository;
        private final OrderRepository orderRepository;
        private final OrderItemRepository orderItemRepository;
        private final UserBalanceLogRepository balanceLogRepository;
        private final CryptoService cryptoService;

        @Transactional
        public CreateOrderPreviewResponse createOrderPreview(
                        Long userId,
                        Long listingId) {
                return createOrderPreview(userId, listingId, null);
        }

        @Transactional
        public CreateOrderPreviewResponse createOrderPreview(
                        Long userId,
                        Long listingId,
                        String serviceInfo) {
                User user = getUser(userId);

                Listing listing = listingRepository.findById(listingId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Listing not found"));

                if (listing.getStatus() != ListingStatus.PUBLISHED) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Listing unavailable");
                }

                BigDecimal currentBalance = user.getBalance();
                BigDecimal price = listing.getPrice();
                BigDecimal remainingBalance = currentBalance.subtract(price);

                Order order = Order.builder()
                                .orderCode("ORD-" + UUID.randomUUID())
                                .user(user)
                                .totalPrice(price)
                                .status(OrderStatus.PENDING)
                                .paymentStatus(PaymentStatus.UNPAID)
                                .serviceInfo(serviceInfo != null ? cryptoService.encrypt(serviceInfo) : null)
                                .build();

                orderRepository.save(order);

                OrderItem orderItem = OrderItem.builder()
                                .order(order)
                                .listing(listing)
                                .listingTitle(listing.getTitle())
                                .listingThumbnail(listing.getThumbnail())
                                .quantity(1)
                                .price(price)
                                .build();

                orderItemRepository.save(orderItem);

                return CreateOrderPreviewResponse.builder()
                                .orderId(order.getId())
                                .orderCode(order.getOrderCode())
                                .listingId(listing.getId())
                                .listingTitle(listing.getTitle())
                                .price(price)
                                .currentBalance(currentBalance)
                                .remainingBalance(remainingBalance)
                                .canPurchase(remainingBalance.compareTo(BigDecimal.ZERO) >= 0)
                                .build();
        }

        @Transactional
        public PurchaseResponse confirmPurchase(
                        Long userId,
                        Long orderId) {
                User user = getUser(userId);

                Order order = orderRepository.findByIdWithUser(orderId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Order not found"));

                if (!order.getUser().getId().equals(userId)) {
                        throw new ResponseStatusException(
                                        HttpStatus.FORBIDDEN,
                                        "You cannot access this order");
                }

                if (order.getStatus() != OrderStatus.PENDING) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Order already processed");
                }

                OrderItem orderItem = orderItemRepository.findByOrderId(order.getId())
                                .stream()
                                .findFirst()
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Order item not found"));

                Listing listing = orderItem.getListing();

                if (listing == null) {
                        throw new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Listing not found");
                }

                if (listing.getStatus() != ListingStatus.PUBLISHED) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Listing unavailable");
                }

                BigDecimal before = user.getBalance();
                BigDecimal price = order.getTotalPrice();

                if (before.compareTo(price) < 0) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Insufficient balance");
                }

                BigDecimal after = before.subtract(price);

                user.setBalance(after);
                userRepository.save(user);

                order.setStatus(OrderStatus.COMPLETED);
                order.setPaymentStatus(PaymentStatus.PAID);
                orderRepository.save(order);

                // Không đánh dấu SOLD_OUT cho SERVICE vì có thể đặt nhiều lần
                if (listing.getListingType() != com.shopacc.backend.enums.ListingType.SERVICE) {
                        listing.setStatus(ListingStatus.SOLD_OUT);
                }
                listingRepository.save(listing);

                UserBalanceLog balanceLog = UserBalanceLog.builder()
                                .user(user)
                                .amountBefore(before)
                                .amountChange(price.negate())
                                .amountAfter(after)
                                .type("PURCHASE")
                                .description("Purchase listing: " + listing.getTitle())
                                .build();

                balanceLogRepository.save(balanceLog);

                return PurchaseResponse.builder()
                                .orderCode(order.getOrderCode())
                                .orderId(order.getId())
                                .listingTitle(listing.getTitle())
                                .message("Purchase successful")
                                .build();
        }

        @Transactional
        public PurchaseResponse purchaseListing(
                        Long userId,
                        Long listingId) {
                return purchaseListing(userId, listingId, null);
        }

        @Transactional
        public PurchaseResponse purchaseListing(
                        Long userId,
                        Long listingId,
                        String serviceInfo) {
                CreateOrderPreviewResponse preview = createOrderPreview(userId, listingId, serviceInfo);

                if (!preview.isCanPurchase()) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Insufficient balance");
                }

                return confirmPurchase(userId, preview.getOrderId());
        }

        public List<OrderResponse> getMyOrders(Long userId) {
                return orderRepository.findByUserIdWithUserOrderByCreatedAtDesc(userId)
                                .stream()
                                .map(this::mapToOrderResponse)
                                .toList();
        }

        public OrderResponse getMyOrderDetail(
                        Long userId,
                        Long orderId) {
                Order order = orderRepository.findByIdWithUser(orderId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Order not found"));

                if (!order.getUser().getId().equals(userId)) {
                        throw new ResponseStatusException(
                                        HttpStatus.FORBIDDEN,
                                        "You cannot access this order");
                }

                return mapToOrderResponse(order);
        }

        public List<OrderResponse> getAllOrdersForAdmin() {
                return orderRepository.findAllWithUserOrderByCreatedAtDesc()
                                .stream()
                                .map(this::mapToOrderResponseForAdmin)
                                .toList();
        }

        public OrderResponse getOrderDetailForAdmin(Long orderId) {
                Order order = orderRepository.findByIdWithUser(orderId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Order not found"));

                return mapToOrderResponseForAdmin(order);
        }

        private OrderResponse mapToOrderResponseForAdmin(Order order) {
                OrderResponse response = mapToOrderResponse(order);
                if (order.getServiceInfo() != null) {
                        response = OrderResponse.builder()
                                        .id(response.getId())
                                        .orderCode(response.getOrderCode())
                                        .userId(response.getUserId())
                                        .username(response.getUsername())
                                        .userEmail(response.getUserEmail())
                                        .totalPrice(response.getTotalPrice())
                                        .status(response.getStatus())
                                        .paymentStatus(response.getPaymentStatus())
                                        .paymentMethod(response.getPaymentMethod())
                                        .createdAt(response.getCreatedAt())
                                        .updatedAt(response.getUpdatedAt())
                                        .items(response.getItems())
                                        .serviceInfo(cryptoService.decrypt(order.getServiceInfo()))
                                        .build();
                }
                return response;
        }

        public OrderSecretResponse getOrderSecret(
                        Long userId,
                        Long orderId) {
                Order order = orderRepository.findByIdWithUser(orderId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Order not found"));

                if (!order.getUser().getId().equals(userId)) {
                        throw new ResponseStatusException(
                                        HttpStatus.FORBIDDEN,
                                        "You cannot access this order");
                }

                if (order.getStatus() != OrderStatus.COMPLETED ||
                                order.getPaymentStatus() != PaymentStatus.PAID) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Order is not completed");
                }

                OrderItem orderItem = orderItemRepository.findByOrderId(order.getId())
                                .stream()
                                .findFirst()
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Order item not found"));

                Listing listing = orderItem.getListing();

                if (listing == null) {
                        throw new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Listing not found");
                }

                String secretData = cryptoService.decrypt(
                                listing.getSecretDataEncrypted());

                return OrderSecretResponse.builder()
                                .orderId(order.getId())
                                .orderCode(order.getOrderCode())
                                .listingTitle(orderItem.getListingTitle())
                                .secretData(secretData)
                                .build();
        }

        private User getUser(Long userId) {
                return userRepository.findById(userId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "User not found"));
        }

        private OrderResponse mapToOrderResponse(Order order) {
                List<OrderItemResponse> items = orderItemRepository.findByOrderId(order.getId())
                                .stream()
                                .map(this::mapToOrderItemResponse)
                                .toList();

                return OrderResponse.builder()
                                .id(order.getId())
                                .orderCode(order.getOrderCode())
                                .userId(order.getUser().getId())
                                .username(order.getUser().getUsername())
                                .userEmail(order.getUser().getEmail())
                                .totalPrice(order.getTotalPrice())
                                .status(order.getStatus())
                                .paymentStatus(order.getPaymentStatus())
                                .paymentMethod(resolvePaymentMethod(order))
                                .createdAt(order.getCreatedAt())
                                .updatedAt(order.getUpdatedAt())
                                .items(items)
                                .serviceInfo(order.getServiceInfo())
                                .build();
        }

        private String resolvePaymentMethod(Order order) {
                if (order.getPaymentStatus() == PaymentStatus.PAID ||
                                order.getPaymentStatus() == PaymentStatus.REFUNDED) {
                        return "Ví tài khoản";
                }

                return "Chưa thanh toán";
        }

        private OrderItemResponse mapToOrderItemResponse(OrderItem item) {
                Long listingId = null;

                if (item.getListing() != null) {
                        listingId = item.getListing().getId();
                }

                return OrderItemResponse.builder()
                                .id(item.getId())
                                .listingId(listingId)
                                .listingTitle(item.getListingTitle())
                                .listingThumbnail(item.getListingThumbnail())
                                .quantity(item.getQuantity())
                                .price(item.getPrice())
                                .build();
        }

        @Transactional
        public void cancelExpiredPendingOrders() {
                LocalDateTime expiredBefore = LocalDateTime.now().minusMinutes(30);

                List<Order> expiredOrders = orderRepository.findByStatusAndPaymentStatusAndCreatedAtBefore(
                                OrderStatus.PENDING,
                                PaymentStatus.UNPAID,
                                expiredBefore);

                for (Order order : expiredOrders) {
                        order.setStatus(OrderStatus.CANCELLED);
                        order.setPaymentStatus(PaymentStatus.UNPAID);
                }

                orderRepository.saveAll(expiredOrders);
        }

        @Transactional
        public OrderResponse refundOrderForAdmin(Long orderId) {
                Order order = orderRepository.findByIdWithUser(orderId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Order not found"));

                if (order.getStatus() != OrderStatus.COMPLETED ||
                                order.getPaymentStatus() != PaymentStatus.PAID) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Only paid completed orders can be refunded");
                }

                User user = order.getUser();

                BigDecimal before = user.getBalance();
                BigDecimal refundAmount = order.getTotalPrice();
                BigDecimal after = before.add(refundAmount);

                user.setBalance(after);
                userRepository.save(user);

                order.setPaymentStatus(PaymentStatus.REFUNDED);
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);

                UserBalanceLog balanceLog = UserBalanceLog.builder()
                                .user(user)
                                .amountBefore(before)
                                .amountChange(refundAmount)
                                .amountAfter(after)
                                .type("REFUND")
                                .description("Refund order: " + order.getOrderCode())
                                .build();

                balanceLogRepository.save(balanceLog);

                return mapToOrderResponse(order);
        }
}