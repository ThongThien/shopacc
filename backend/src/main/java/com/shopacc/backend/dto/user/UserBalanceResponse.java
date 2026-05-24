package com.shopacc.backend.dto.user;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class UserBalanceResponse {

    private Long userId;

    private String username;

    private BigDecimal balance;
}