package com.shopacc.backend.controller;

import jakarta.validation.Valid;
import com.shopacc.backend.dto.auth.AuthResponse;
import com.shopacc.backend.dto.auth.LoginRequest;
import com.shopacc.backend.dto.auth.RegisterRequest;
import com.shopacc.backend.service.AuthService;
import com.shopacc.backend.service.JwtService;
import com.shopacc.backend.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;

    @PostMapping("/register")
    public AuthResponse register(
            @Valid @RequestBody RegisterRequest request) {

        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing refreshToken");
        }
        var entity = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));
        if (entity.isRevoked() || entity.getExpiredAt().isBefore(java.time.LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expired");
        }
        String newAccess = jwtService.generateAccessToken(entity.getUser().getEmail());
        return AuthResponse.builder()
                .accessToken(newAccess)
                .refreshToken(refreshToken)
                .role(entity.getUser().getRole().name())
                .build();
    }
}