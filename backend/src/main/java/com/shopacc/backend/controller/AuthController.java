package com.shopacc.backend.controller;

import jakarta.validation.Valid;
import com.shopacc.backend.dto.auth.AuthResponse;
import com.shopacc.backend.dto.auth.LoginRequest;
import com.shopacc.backend.dto.auth.RegisterRequest;
import com.shopacc.backend.service.AuthService;
import com.shopacc.backend.service.CaptchaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String REFRESH_COOKIE = "refreshToken";

    private final AuthService authService;

    private final CaptchaService captchaService;

    @GetMapping("/captcha")
    public Map<String, String> captcha() {
        return captchaService.generate();
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return withRefreshCookie(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return withRefreshCookie(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(name = REFRESH_COOKIE, required = false) String cookieToken,
            @RequestBody(required = false) Map<String, String> body) {
        String refreshToken = resolveRefreshToken(cookieToken, body);
        if (refreshToken == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing refreshToken");
        }
        return withRefreshCookie(authService.refresh(refreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = REFRESH_COOKIE, required = false) String cookieToken,
            @RequestBody(required = false) Map<String, String> body) {
        authService.logout(resolveRefreshToken(cookieToken, body));
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, expiredRefreshCookie().toString())
                .build();
    }

    private String resolveRefreshToken(String cookieToken, Map<String, String> body) {
        if (cookieToken != null && !cookieToken.isBlank()) {
            return cookieToken;
        }
        String fromBody = body == null ? null : body.get("refreshToken");
        return (fromBody == null || fromBody.isBlank()) ? null : fromBody;
    }

    // Strict: FE (shopthien.xyz / localhost:3000) và BE (api.shopthien.xyz / localhost:8081)
    // là same-site. Nếu sau này FE chạy trên domain khác hẳn (vd *.vercel.app) thì phải đổi
    // sang SameSite=None, khi đó mới gửi được cookie cross-site.
    private ResponseEntity<AuthResponse> withRefreshCookie(AuthResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, response.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/api/auth")
                .maxAge(Duration.ofDays(7))
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    private ResponseCookie expiredRefreshCookie() {
        return ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/api/auth")
                .maxAge(0)
                .build();
    }
}
