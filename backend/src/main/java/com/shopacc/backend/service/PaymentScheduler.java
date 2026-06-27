package com.shopacc.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.shopacc.backend.entity.Transaction;
import com.shopacc.backend.enums.TransactionStatus;
import com.shopacc.backend.repository.TransactionRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentScheduler {

    private final TransactionRepository transactionRepository;

    @Transactional
    @Scheduled(fixedRate = 300000)
    public void expirePendingTransactions() {

        List<Transaction> transactions = transactionRepository.findByStatusAndExpiredAtBefore(
                TransactionStatus.PENDING,
                LocalDateTime.now());

        for (Transaction t : transactions) {
            t.setStatus(TransactionStatus.EXPIRED);
            t.setDescription("Auto expired");
        }

        transactionRepository.saveAll(transactions);
    }
}