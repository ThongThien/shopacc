package com.shopacc.backend.dto.order;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class OrderItemResponse {

    private Long id;

    private Long listingId;

    private String listingTitle;

    private String listingThumbnail;

    private Integer quantity;

    private BigDecimal price;
}