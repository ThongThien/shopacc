package com.shopacc.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

import java.util.Date;

@Service
public class JwtService {

        @Value("${jwt.secret}")
        private String secretKey;

        private SecretKey getSignInKey() {

                return Keys.hmacShaKeyFor(
                                secretKey.getBytes());
        }

        public String generateAccessToken(
                        String email) {

                return Jwts.builder()

                                .subject(email)

                                .issuedAt(new Date())

                                .expiration(
                                                new Date(
                                                                System.currentTimeMillis()
                                                                                + 1000L * 60 * 15))

                                .signWith(getSignInKey())

                                .compact();
        }

        public String generateRefreshToken(
                        String email) {

                return Jwts.builder()

                                .subject(email)

                                .issuedAt(new Date())

                                .expiration(
                                                new Date(
                                                                System.currentTimeMillis()
                                                                                + 1000L * 60 * 60 * 24 * 7))

                                .signWith(getSignInKey())

                                .compact();
        }

        public String extractUsername(
                        String token) {

                return extractAllClaims(token)
                                .getSubject();
        }

        public boolean isTokenValid(
                        String token,
                        String email) {

                final String username = extractUsername(token);

                return username.equals(email)
                                && !isTokenExpired(token);
        }

        private boolean isTokenExpired(
                        String token) {

                return extractAllClaims(token)
                                .getExpiration()
                                .before(new Date());
        }

        private Claims extractAllClaims(
                        String token) {

                return Jwts.parser()

                                .verifyWith(getSignInKey())

                                .build()

                                .parseSignedClaims(token)

                                .getPayload();
        }
}