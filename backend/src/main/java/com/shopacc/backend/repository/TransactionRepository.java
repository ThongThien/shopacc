package com.shopacc.backend.repository;

import com.shopacc.backend.entity.Transaction;
import com.shopacc.backend.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Transaction> findByUserIdAndTypeOrderByCreatedAtDesc(
            Long userId,
            TransactionType type);

    List<Transaction> findAllByOrderByCreatedAtDesc();

    Optional<Transaction> findByTransactionCode(String transactionCode);

    boolean existsByProviderTransactionId(String providerTransactionId);
}