package com.shopacc.backend.dto.order;
import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreateOrderPreviewResponse {

    private Long orderId;

    private String orderCode;

    private Long listingId;

    private String listingTitle;

    private BigDecimal  price;

    private BigDecimal  currentBalance;

    private BigDecimal  remainingBalance;

    private boolean canPurchase;
}