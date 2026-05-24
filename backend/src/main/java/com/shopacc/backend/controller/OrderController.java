package com.shopacc.backend.controller;

import com.shopacc.backend.dto.order.PurchaseResponse;
import com.shopacc.backend.security.CustomUserDetails;
import com.shopacc.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/purchase/{listingId}")
    public PurchaseResponse purchase(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long listingId
    ) {

        return orderService.purchaseListing(
                userDetails.getId(),
                listingId
        );
    }
}