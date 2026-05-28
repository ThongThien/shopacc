package com.shopacc.backend.dto.order;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderSecretResponse {

    private Long orderId;

    private String orderCode;

    private String listingTitle;

    private String secretData;
}