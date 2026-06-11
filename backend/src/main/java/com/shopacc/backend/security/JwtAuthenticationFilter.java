package com.shopacc.backend.security;

import com.shopacc.backend.service.JwtService;

import jakarta.servlet.*;
import jakarta.servlet.http.*;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter
                extends OncePerRequestFilter {

        private final JwtService jwtService;

        private final CustomUserDetailsService userDetailsService;

        @Override
        protected void doFilterInternal(
                        HttpServletRequest request,
                        HttpServletResponse response,
                        FilterChain filterChain) throws ServletException, IOException {

                final String authHeader = request.getHeader("Authorization");
                System.out.println("==== JWT FILTER ====");
                System.out.println(authHeader);

                if (authHeader == null
                                || !authHeader.startsWith("Bearer ")) {

                        filterChain.doFilter(
                                        request,
                                        response);

                        return;
                }

                String jwt = authHeader.substring(7);

                String email = jwtService.extractUsername(jwt);
                System.out.println("JWT: " + jwt);
                System.out.println("EMAIL: " + email);

                if (email != null
                                && SecurityContextHolder
                                                .getContext()
                                                .getAuthentication() == null) {

                        CustomUserDetails userDetails = (CustomUserDetails) userDetailsService
                                        .loadUserByUsername(email);

                        if (jwtService.isTokenValid(
                                        jwt,
                                        userDetails.getUsername())) {

                                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                                userDetails,
                                                null,
                                                userDetails.getAuthorities());

                                authToken.setDetails(
                                                new WebAuthenticationDetailsSource()
                                                                .buildDetails(request));

                                SecurityContextHolder
                                                .getContext()
                                                .setAuthentication(authToken);
                        }
                }

                filterChain.doFilter(
                                request,
                                response);
        }
}