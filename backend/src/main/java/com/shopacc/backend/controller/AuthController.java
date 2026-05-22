package com.shopacc.backend.controller;

import com.shopacc.backend.dto.auth.AuthResponse;
import com.shopacc.backend.dto.auth.LoginRequest;
import com.shopacc.backend.dto.auth.RegisterRequest;
import com.shopacc.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(
            @RequestBody RegisterRequest request
    ) {

        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(
            @RequestBody LoginRequest request
    ) {
        System.out.println("LOGIN API HIT");
        return authService.login(request);
    }
}