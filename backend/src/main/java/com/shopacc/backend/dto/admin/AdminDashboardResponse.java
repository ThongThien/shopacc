package com.shopacc.backend.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class AdminDashboardResponse {

    private BigDecimal adminBalance;

    private BigDecimal revenueThisMonth;

    private BigDecimal revenueAllTime;

    private Long totalUsers;

    private Long totalListings;

    private Long publishedListings;

    private Long soldListings;

    private Long totalOrders;

    private Long ordersThisMonth;

    private List<TopOrderItem> topOrders;

    @Data
    @Builder
    public static class TopOrderItem {

        private Long orderId;

        private String orderCode;

        private String username;

        private BigDecimal totalPrice;

        private String createdAt;
    }
}