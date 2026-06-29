package com.shopacc.backend.dto.payment;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

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

    // SePay docs dùng transferAmount (camelCase).
    @JsonProperty("transferAmount")
    private BigDecimal transferAmount;

    // Fallback nếu payload gửi transfer_amount (snake_case)
    @JsonProperty("transfer_amount")
    private BigDecimal transferAmountSnake;

    // Note: lombok @Getter/@Setter đã tạo getter/setter cho fields.
    // Ta override getter/setter cho transferAmount để fallback đúng snake_case.
    public BigDecimal getTransferAmount() {
        return transferAmount != null ? transferAmount : transferAmountSnake;
    }

    public void setTransferAmount(BigDecimal transferAmount) {
        this.transferAmount = transferAmount;
    }

    private BigDecimal accumulated;

    private String referenceCode;

    private String currency;
}