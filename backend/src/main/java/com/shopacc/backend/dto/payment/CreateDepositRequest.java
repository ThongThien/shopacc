package com.shopacc.backend.dto.payment;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreateDepositRequest {

    private BigDecimal amount;
}