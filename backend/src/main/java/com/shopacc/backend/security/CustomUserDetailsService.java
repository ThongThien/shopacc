package com.shopacc.backend.security;

import com.shopacc.backend.entity.User;
import com.shopacc.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService
                implements UserDetailsService {

        private final UserRepository userRepository;

        @Override
        public UserDetails loadUserByUsername(
                        String email) throws UsernameNotFoundException {

                User user = userRepository.findByEmail(email)
                                .orElseThrow(
                                                () -> new UsernameNotFoundException(
                                                                "User not found"));

                return new CustomUserDetails(user);
        }
}