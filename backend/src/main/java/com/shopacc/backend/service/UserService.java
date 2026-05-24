package com.shopacc.backend.service;

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
                .build();
    }
}