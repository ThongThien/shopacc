package com.shopacc.backend.dto.order;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PurchaseResponse {

    private String orderCode;

    private String listingTitle;

    private String secretData;
}