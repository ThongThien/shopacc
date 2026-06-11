package com.shopacc.backend.controller;

import jakarta.validation.Valid;
import com.shopacc.backend.dto.payment.CreateDepositRequest;
import com.shopacc.backend.dto.payment.DepositResponse;
import com.shopacc.backend.dto.user.TransactionResponse;
import com.shopacc.backend.security.CustomUserDetails;
import com.shopacc.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

        private final PaymentService paymentService;

        @PostMapping("/deposits")
        public DepositResponse createDeposit(
                        @AuthenticationPrincipal CustomUserDetails userDetails,
                        @Valid @RequestBody CreateDepositRequest request) {

                return paymentService.createDeposit(
                                userDetails.getId(),
                                request);
        }

        @GetMapping("/deposits")
        public List<TransactionResponse> getMyDeposits(
                        @AuthenticationPrincipal CustomUserDetails userDetails) {

                return paymentService.getMyDeposits(
                                userDetails.getId());
        }
}