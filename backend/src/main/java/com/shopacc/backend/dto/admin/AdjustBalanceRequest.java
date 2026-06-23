package com.shopacc.backend.dto.admin;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class AdjustBalanceRequest {

    @NotNull(message = "amount is required")
    private BigDecimal amount;

    private String note;
}