package com.shopacc.backend.controller;

import com.shopacc.backend.security.CustomUserDetails;

import com.shopacc.backend.service.PurchaseService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseService purchaseService;

    @PostMapping("/purchase/{listingId}")
    public String purchase(

            @AuthenticationPrincipal
            CustomUserDetails userDetails,

            @PathVariable
            Long listingId
    ) {

        System.out.println("PURCHASE API HIT");

        if (userDetails == null) {

            return "USER DETAILS NULL";
        }

        System.out.println(
                userDetails.getUsername()
        );

        System.out.println(
                userDetails.getAuthorities()
        );

        return purchaseService.purchaseListing(
                userDetails.getId(),
                listingId
        );
    }
}