package com.shopacc.backend.dto.user;

import com.shopacc.backend.enums.TransactionStatus;
import com.shopacc.backend.enums.TransactionType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class TransactionResponse {

    private Long id;

    private Long userId;

    private String username;

    private String email;

    private String transactionCode;

    private TransactionType type;

    private BigDecimal amount;

    private TransactionStatus status;

    private String provider;

    private String description;

    private LocalDateTime createdAt;
}