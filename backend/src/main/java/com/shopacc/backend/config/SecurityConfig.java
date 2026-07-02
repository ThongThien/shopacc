package com.shopacc.backend.config;

import com.shopacc.backend.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;

import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtFilter;

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http) throws Exception {

                http
                                .cors(cors -> {
                                })

                                // CSRF disable (OK for JWT + webhook)
                                .csrf(csrf -> csrf.disable())

                                // Stateless API
                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))

                                .authorizeHttpRequests(auth -> auth

                                                // =========================
                                                // PUBLIC AUTH
                                                // =========================
                                                .requestMatchers("/api/auth/**")
                                                .permitAll()

                                                // =========================
                                                // WEBHOOK (IMPORTANT - MUST BE PUBLIC)
                                                // =========================
                                                .requestMatchers("/api/webhooks/**")
                                                .permitAll()

                                                // =========================
                                                // SWAGGER / DOCS
                                                // =========================
                                                .requestMatchers(
                                                                "/swagger-ui/**",
                                                                "/swagger-ui.html",
                                                                "/v3/api-docs/**")
                                                .permitAll()

                                                // =========================
                                                // SERVICES — Public read
                                                // =========================
                                                .requestMatchers(HttpMethod.GET, "/api/services/**")
                                                .permitAll()

                                                // =========================
                                                // LISTINGS
                                                // =========================
                                                .requestMatchers(HttpMethod.GET, "/api/listings/**")
                                                .permitAll()

                                                .requestMatchers(HttpMethod.POST, "/api/listings/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers(HttpMethod.POST, "/api/listings/*/images")
                                                .hasRole("ADMIN")

                                                // =========================
                                                // ADMIN
                                                // =========================
                                                .requestMatchers("/api/admin/**")
                                                .hasRole("ADMIN")

                                                // =========================
                                                // USER PROFILE
                                                // =========================
                                                .requestMatchers("/api/users/me/**")
                                                .authenticated()

                                                // =========================
                                                // ORDERS
                                                // =========================
                                                .requestMatchers("/api/orders/**")
                                                .authenticated()

                                                // =========================
                                                // PAYMENTS (USER ONLY)
                                                // =========================
                                                .requestMatchers("/api/payments/**")
                                                .authenticated()

                                                // fallback
                                                .anyRequest()
                                                .authenticated())

                                // JWT FILTER (IMPORTANT: MUST BYPASS WEBHOOK INSIDE FILTER)
                                .addFilterBefore(
                                                jwtFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}