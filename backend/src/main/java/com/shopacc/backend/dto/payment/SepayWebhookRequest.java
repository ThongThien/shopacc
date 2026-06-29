package com.shopacc.backend.dto.payment;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

@Getter
@Setter
public class SepayWebhookRequest {

    private Long id;

    private String gateway;

    private String transactionDate;

    private String accountNumber;

    private String subAccount;

    private String code;

    private String content;

    private String transferType;

    private String description;

    /**
     * SePay hiện dùng transferAmount (camelCase).
     * Giữ JsonAlias để tương thích payload cũ dùng transfer_amount.
     */
    @JsonProperty("transferAmount")
    @JsonAlias("transfer_amount")
    private BigDecimal transferAmount;

    private BigDecimal accumulated;

    private String referenceCode;

    private String currency;
}