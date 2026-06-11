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

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

        private final OrderService orderService;
        private final AuditLogService auditLogService;

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
}