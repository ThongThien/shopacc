package com.shopacc.backend.controller;

import com.shopacc.backend.dto.order.OrderResponse;
import com.shopacc.backend.dto.order.PurchaseResponse;
import com.shopacc.backend.security.CustomUserDetails;
import com.shopacc.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.shopacc.backend.dto.order.OrderSecretResponse;
import com.shopacc.backend.enums.AuditAction;
import com.shopacc.backend.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;
import com.shopacc.backend.repository.DiscountCodeRepository;
import com.shopacc.backend.entity.DiscountCode;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

        private final OrderService orderService;
        private final AuditLogService auditLogService;
        private final DiscountCodeRepository discountCodeRepository;

        @PostMapping("/purchase/{listingId}")
        public PurchaseResponse purchase(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long listingId,
                        HttpServletRequest httpRequest) {

                PurchaseResponse response = orderService.purchaseListing(
                                userDetails.getId(),
                                listingId);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.USER_PURCHASE,
                                "listingId=" + listingId + ", orderId=" + response.getOrderId(),
                                httpRequest);

                return response;
        }

        @GetMapping("/my")
        public List<OrderResponse> getMyOrders(
                        @AuthenticationPrincipal CustomUserDetails userDetails) {

                return orderService.getMyOrders(
                                userDetails.getId());
        }

        @GetMapping("/{orderId}")
        public OrderResponse getMyOrderDetail(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long orderId) {

                return orderService.getMyOrderDetail(
                                userDetails.getId(),
                                orderId);
        }

        @GetMapping("/{orderId}/secret")
        public OrderSecretResponse getOrderSecret(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @PathVariable Long orderId,
                        HttpServletRequest httpRequest) {

                OrderSecretResponse response = orderService.getOrderSecret(
                                userDetails.getId(),
                                orderId);

                auditLogService.log(
                                userDetails.getId(),
                                AuditAction.USER_VIEW_SECRET,
                                "orderId=" + orderId,
                                httpRequest);

                return response;
        }

        @GetMapping("/validate-discount")
        public Map<String, Object> validateDiscount(
                        @RequestParam String code,
                        @RequestParam BigDecimal total) {

                DiscountCode discount = discountCodeRepository.findByCodeAndIsActiveTrue(code)
                                .orElse(null);

                if (discount == null) {
                        return Map.of("valid", false, "message", "Mã giảm giá không tồn tại hoặc đã hết hạn");
                }

                if (discount.getExpiresAt() != null &&
                                discount.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
                        return Map.of("valid", false, "message", "Mã giảm giá đã hết hạn");
                }

                if (discount.getMaxUsage() != null &&
                                discount.getUsedCount() >= discount.getMaxUsage()) {
                        return Map.of("valid", false, "message", "Mã giảm giá đã hết lượt dùng");
                }

                if (discount.getMinOrderAmount() != null &&
                                total.compareTo(discount.getMinOrderAmount()) < 0) {
                        return Map.of("valid", false, "message",
                                        "Đơn tối thiểu " + discount.getMinOrderAmount() + "đ");
                }

                BigDecimal discountAmount;
                if ("PERCENT".equals(discount.getType())) {
                        discountAmount = total.multiply(discount.getValue())
                                        .divide(new BigDecimal("100"));
                } else {
                        discountAmount = discount.getValue().min(total);
                }

                BigDecimal finalTotal = total.subtract(discountAmount);

                return Map.of(
                                "valid", true,
                                "discountId", discount.getId(),
                                "code", discount.getCode(),
                                "type", discount.getType(),
                                "value", discount.getValue(),
                                "discountAmount", discountAmount,
                                "originalTotal", total,
                                "finalTotal", finalTotal);
        }
}