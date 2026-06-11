package com.shopacc.backend.controller;

import jakarta.validation.Valid;
import com.shopacc.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class SepayWebhookController {

        private final PaymentService paymentService;

        @PostMapping("/sepay")
        public ResponseEntity<Map<String, Boolean>> handleSepayWebhook(
                        @Valid @RequestBody String rawBody,

                        @RequestHeader("X-SePay-Signature") String signature,

                        @RequestHeader("X-SePay-Timestamp") String timestamp) {

                paymentService.handleSepayWebhook(
                                rawBody,
                                signature,
                                timestamp);

                return ResponseEntity.ok(
                                Map.of("success", true));
        }
}