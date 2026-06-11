package com.shopacc.backend.controller;

import java.util.Map;
import jakarta.validation.Valid;
import com.shopacc.backend.dto.user.ChangePasswordRequest;
import com.shopacc.backend.dto.user.UserProfileResponse;
import com.shopacc.backend.dto.user.TransactionResponse;
import com.shopacc.backend.dto.user.UserBalanceResponse;
import com.shopacc.backend.security.CustomUserDetails;
import com.shopacc.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/balance")
    public UserBalanceResponse getMyBalance(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        return userService.getMyBalance(userDetails.getId());
    }

    @GetMapping("/transactions")
    public List<TransactionResponse> getMyTransactions(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        return userService.getMyTransactions(userDetails.getId());
    }

    @GetMapping("/profile")
    public UserProfileResponse profile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return userService.getProfile(userDetails);
    }

    @PutMapping("/password")
    public Map<String, String> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(userDetails, request);

        return Map.of(
                "message",
                "Password changed successfully");
    }
}