package com.shopacc.backend.repository;

import com.shopacc.backend.entity.Transaction;
import com.shopacc.backend.enums.TransactionType;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import com.shopacc.backend.entity.Transaction;
import com.shopacc.backend.enums.TransactionStatus;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Transaction> findByUserIdAndTypeOrderByCreatedAtDesc(
            Long userId,
            TransactionType type);

    List<Transaction> findAllByOrderByCreatedAtDesc();

    // Optional<Transaction> findByTransactionCode(String transactionCode);

    boolean existsByProviderTransactionId(String providerTransactionId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
                select t
                from Transaction t
                where t.transactionCode = :transactionCode
            """)
    Optional<Transaction> findByTransactionCodeForUpdate(String transactionCode);

    List<Transaction> findByStatusAndExpiredAtBefore(
            TransactionStatus status,
            LocalDateTime expiredAt);
}