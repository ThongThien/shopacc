package com.shopacc.backend.dto.payment;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreateDepositRequest {

    @NotNull(message = "amount is required")
    @DecimalMin(value = "1000", message = "amount must be at least 1000")
    private BigDecimal amount;
}