package com.shopacc.backend.dto.order;

import com.shopacc.backend.enums.OrderStatus;
import com.shopacc.backend.enums.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class OrderResponse {

    private Long id;

    private String orderCode;

    private Long userId;

    private String username;

    private String userEmail;

    private BigDecimal totalPrice;

    private OrderStatus status;

    private PaymentStatus paymentStatus;

    private String paymentMethod;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<OrderItemResponse> items;

    private String serviceInfo; // AES-encrypted, admin-only
}