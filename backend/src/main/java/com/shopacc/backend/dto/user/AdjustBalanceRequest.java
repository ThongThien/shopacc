package com.shopacc.backend.dto.user;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class AdjustBalanceRequest {

    private BigDecimal amount;

    private String description;
}