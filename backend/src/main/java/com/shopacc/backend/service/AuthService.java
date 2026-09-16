package com.shopacc.backend.service;

import com.shopacc.backend.dto.auth.AuthResponse;
import com.shopacc.backend.dto.auth.LoginRequest;
import com.shopacc.backend.dto.auth.RegisterRequest;

import com.shopacc.backend.entity.RefreshToken;
import com.shopacc.backend.entity.User;

import com.shopacc.backend.enums.UserRole;
import com.shopacc.backend.enums.UserStatus;

import com.shopacc.backend.repository.RefreshTokenRepository;
import com.shopacc.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;

        private final RefreshTokenRepository refreshTokenRepository;

        private final PasswordEncoder passwordEncoder;

        private final JwtService jwtService;

        private final CaptchaService captchaService;

        public AuthResponse register(
                        RegisterRequest request) {

                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                        "Email đã được đăng ký. Vui lòng dùng email khác.");
                }
                if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                        "Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.");
                }

                User user = User.builder()
                                .username(request.getUsername())
                                .email(request.getEmail())
                                .passwordHash(
                                                passwordEncoder.encode(
                                                                request.getPassword()))
                                .role(UserRole.USER)
                                .status(UserStatus.ACTIVE)
                                .balance(BigDecimal.ZERO)
                                .build();

                userRepository.save(user);

                String accessToken = jwtService.generateAccessToken(
                                user.getEmail());

                String refreshToken = jwtService.generateRefreshToken(
                                user.getEmail());

                RefreshToken refreshTokenEntity = RefreshToken.builder()
                                .user(user)
                                .token(refreshToken)
                                .expiredAt(
                                                LocalDateTime.now().plusDays(7))
                                .revoked(false)
                                .build();

                refreshTokenRepository.save(
                                refreshTokenEntity);

                return AuthResponse.builder()
                                .accessToken(accessToken)
                                .refreshToken(refreshToken)
                                .role(user.getRole().name())
                                .build();
        }

        public AuthResponse login(
                        LoginRequest request) {

                captchaService.verify(request.getCaptchaId(), request.getCaptchaCode());

                User user = userRepository.findByEmail(
                                request.getEmail()).orElseThrow(
                                                () -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                                                "Email hoặc mật khẩu không đúng"));

                if (!passwordEncoder.matches(
                                request.getPassword(),
                                user.getPasswordHash())) {

                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                        "Email hoặc mật khẩu không đúng");
                }
                if (user.getStatus() == UserStatus.BANNED) {
                        throw new ResponseStatusException(
                                        HttpStatus.FORBIDDEN,
                                        "Tài khoản đã bị khóa");
                }

                String accessToken = jwtService.generateAccessToken(
                                user.getEmail());

                String refreshToken = jwtService.generateRefreshToken(
                                user.getEmail());

                RefreshToken refreshTokenEntity = RefreshToken.builder()
                                .user(user)
                                .token(refreshToken)
                                .expiredAt(
                                                LocalDateTime.now().plusDays(7))
                                .revoked(false)
                                .build();

                refreshTokenRepository.save(
                                refreshTokenEntity);

                return AuthResponse.builder()
                                .accessToken(accessToken)
                                .refreshToken(refreshToken)
                                .role(user.getRole().name())
                                .build();
        }

        // noRollbackFor: khi phát hiện reuse, lệnh revoke-all phải được commit dù method ném 401
        @Transactional(noRollbackFor = ResponseStatusException.class)
        public AuthResponse refresh(String refreshToken) {

                RefreshToken entity = refreshTokenRepository
                                .findByToken(refreshToken)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.UNAUTHORIZED,
                                                "Refresh token không hợp lệ"));

                if (entity.getRevoked()) {
                        // Reuse detection: token đã rotate mà vẫn bị dùng lại
                        // → nghi bị đánh cắp → thu hồi toàn bộ phiên của user
                        refreshTokenRepository.revokeAllActiveByUserId(
                                        entity.getUser().getId());

                        throw new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "Refresh token đã bị thu hồi. Vui lòng đăng nhập lại.");
                }

                if (entity.getExpiredAt().isBefore(LocalDateTime.now())) {
                        throw new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "Refresh token đã hết hạn");
                }

                // Rotation: thu hồi token cũ, phát hành cặp token mới
                entity.setRevoked(true);

                User user = entity.getUser();

                String newAccessToken = jwtService.generateAccessToken(
                                user.getEmail());

                String newRefreshToken = jwtService.generateRefreshToken(
                                user.getEmail());

                refreshTokenRepository.save(RefreshToken.builder()
                                .user(user)
                                .token(newRefreshToken)
                                .expiredAt(LocalDateTime.now().plusDays(7))
                                .revoked(false)
                                .build());

                return AuthResponse.builder()
                                .accessToken(newAccessToken)
                                .refreshToken(newRefreshToken)
                                .role(user.getRole().name())
                                .build();
        }

        @Transactional
        public void logout(String refreshToken) {

                if (refreshToken == null || refreshToken.isBlank()) {
                        return;
                }

                refreshTokenRepository.findByToken(refreshToken)
                                .filter(entity -> !entity.getRevoked())
                                .ifPresent(entity -> {
                                        entity.setRevoked(true);
                                        refreshTokenRepository.save(entity);
                                });
        }
}