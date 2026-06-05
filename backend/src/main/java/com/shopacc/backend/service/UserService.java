package com.shopacc.backend.service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.shopacc.backend.security.CustomUserDetails;
import com.shopacc.backend.dto.user.ChangePasswordRequest;
import com.shopacc.backend.dto.user.UserProfileResponse;
import com.shopacc.backend.dto.user.TransactionResponse;
import com.shopacc.backend.dto.user.UserBalanceResponse;
import com.shopacc.backend.entity.Transaction;
import com.shopacc.backend.entity.User;
import com.shopacc.backend.repository.TransactionRepository;
import com.shopacc.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    private final TransactionRepository transactionRepository;

    public UserBalanceResponse getMyBalance(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return UserBalanceResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .balance(user.getBalance())
                .build();
    }

    public List<TransactionResponse> getMyTransactions(Long userId) {

        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapTransaction)
                .toList();
    }

    private TransactionResponse mapTransaction(Transaction transaction) {

        return TransactionResponse.builder()
                .id(transaction.getId())
                .transactionCode(transaction.getTransactionCode())
                .type(transaction.getType())
                .amount(transaction.getAmount())
                .status(transaction.getStatus())
                .provider(transaction.getProvider())
                .description(transaction.getDescription())
                .createdAt(transaction.getCreatedAt())
                .userId(transaction.getUser().getId())
                .username(transaction.getUser().getUsername())
                .email(transaction.getUser().getEmail())
                .build();
    }

    private final PasswordEncoder passwordEncoder;

    public UserProfileResponse getProfile(CustomUserDetails userDetails) {

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));

        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .balance(user.getBalance())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLoginAt(null)
                .build();
    }

    public void changePassword(
            CustomUserDetails userDetails,
            ChangePasswordRequest request
    ) {

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPasswordHash()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Current password is incorrect"
            );
        }

        user.setPasswordHash(
                passwordEncoder.encode(request.getNewPassword())
        );

        userRepository.save(user);
    }
}