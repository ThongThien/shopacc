package com.shopacc.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import com.shopacc.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class SepayWebhookController {

        private final PaymentService paymentService;

        @PostMapping("/sepay")
        public ResponseEntity<Map<String, Boolean>> handleSepayWebhook(
                        HttpServletRequest request) throws Exception {
                if ("HEAD".equals(request.getMethod())) {
                        return ResponseEntity.ok().build();
                }

                String rawBody = new String(request.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

                String signature = request.getHeader("X-SePay-Signature");
                String timestamp = request.getHeader("X-SePay-Timestamp");

                System.out.println("RAW BODY = " + rawBody);
                System.out.println("SIGNATURE = " + signature);
                System.out.println("TIMESTAMP = " + timestamp);

                paymentService.handleSepayWebhook(rawBody, signature, timestamp);

                return ResponseEntity.ok(Map.of("success", true));
        }
}