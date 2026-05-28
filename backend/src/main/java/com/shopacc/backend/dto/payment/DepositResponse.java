package com.shopacc.backend.dto.payment;

import com.shopacc.backend.enums.TransactionStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class DepositResponse {

    private String transactionCode;

    private BigDecimal amount;

    private TransactionStatus status;

    private String transferContent;
}