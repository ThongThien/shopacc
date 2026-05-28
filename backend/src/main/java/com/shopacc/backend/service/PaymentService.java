package com.shopacc.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopacc.backend.dto.payment.CreateDepositRequest;
import com.shopacc.backend.dto.payment.DepositResponse;
import com.shopacc.backend.dto.payment.SepayWebhookRequest;
import com.shopacc.backend.entity.Transaction;
import com.shopacc.backend.entity.User;
import com.shopacc.backend.entity.UserBalanceLog;
import com.shopacc.backend.enums.TransactionStatus;
import com.shopacc.backend.enums.TransactionType;
import com.shopacc.backend.repository.TransactionRepository;
import com.shopacc.backend.repository.UserBalanceLogRepository;
import com.shopacc.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.shopacc.backend.dto.user.TransactionResponse;

import java.util.List;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final Pattern DEPOSIT_CODE_PATTERN =
            Pattern.compile("DEP-[a-fA-F0-9\\-]{36}");

    private final UserRepository userRepository;

    private final TransactionRepository transactionRepository;

    private final UserBalanceLogRepository balanceLogRepository;

    private final ObjectMapper objectMapper;

    @Value("${SEPAY_SECRET_KEY}")
    private String sepaySecretKey;

    public DepositResponse createDeposit(
            Long userId,
            CreateDepositRequest request
    ) {

        if (request.getAmount() == null ||
                request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Deposit amount must be greater than 0"
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));

        String transactionCode =
                "DEP-" + java.util.UUID.randomUUID();

        Transaction transaction = Transaction.builder()
                .user(user)
                .transactionCode(transactionCode)
                .type(TransactionType.DEPOSIT)
                .amount(request.getAmount())
                .status(TransactionStatus.PENDING)
                .provider("SEPAY_MB_BANK")
                .description("Pending bank deposit")
                .build();

        transactionRepository.save(transaction);

        return DepositResponse.builder()
                .transactionCode(transactionCode)
                .amount(transaction.getAmount())
                .status(transaction.getStatus())
                .transferContent(transactionCode)
                .build();
    }

    @Transactional
    public void handleSepayWebhook(
            String rawBody,
            String signature,
            String timestamp
    ) {

        verifySepaySignature(
                rawBody,
                signature,
                timestamp
        );

        SepayWebhookRequest request;

        try {
            request = objectMapper.readValue(
                    rawBody,
                    SepayWebhookRequest.class
            );
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid SePay payload"
            );
        }

        if (!"in".equalsIgnoreCase(request.getTransferType())) {
            return;
        }

        String transactionCode =
                extractDepositCode(
                        request.getContent()
                );

        Transaction transaction =
                transactionRepository
                        .findByTransactionCode(transactionCode)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Deposit transaction not found"
                        ));

        if (transaction.getStatus() == TransactionStatus.SUCCESS) {
            return;
        }

        if (request.getReferenceCode() != null &&
                transactionRepository.existsByProviderTransactionId(
                        request.getReferenceCode()
                )) {
            return;
        }

        if (transaction.getAmount().compareTo(
                request.getTransferAmount()
        ) != 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid deposit amount"
            );
        }

        User user = transaction.getUser();

        BigDecimal amountBefore = user.getBalance();

        BigDecimal amountAfter =
                amountBefore.add(transaction.getAmount());

        user.setBalance(amountAfter);
        userRepository.save(user);

        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setProviderTransactionId(request.getReferenceCode());
        transaction.setDescription(
                "SePay deposit success: " + request.getDescription()
        );
        transactionRepository.save(transaction);

        UserBalanceLog balanceLog =
                UserBalanceLog.builder()
                        .user(user)
                        .amountBefore(amountBefore)
                        .amountChange(transaction.getAmount())
                        .amountAfter(amountAfter)
                        .type("DEPOSIT")
                        .description(
                                "SePay deposit: " +
                                        transaction.getTransactionCode()
                        )
                        .build();

        balanceLogRepository.save(balanceLog);
    }

    private void verifySepaySignature(
            String rawBody,
            String signature,
            String timestamp
    ) {

        if (signature == null ||
                signature.isBlank() ||
                timestamp == null ||
                timestamp.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Missing SePay signature"
            );
        }

        long requestTime;

        try {
            requestTime = Long.parseLong(timestamp);
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid SePay timestamp"
            );
        }

        long now = System.currentTimeMillis() / 1000;

        if (Math.abs(now - requestTime) > 300) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Expired SePay webhook"
            );
        }

        String expectedSignature =
                "sha256=" + hmacSha256Hex(
                        timestamp + "." + rawBody,
                        sepaySecretKey
                );

        if (!MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                signature.getBytes(StandardCharsets.UTF_8)
        )) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid SePay signature"
            );
        }
    }

    private String hmacSha256Hex(
            String data,
            String secret
    ) {

        try {
            Mac mac = Mac.getInstance("HmacSHA256");

            SecretKeySpec secretKeySpec =
                    new SecretKeySpec(
                            secret.getBytes(StandardCharsets.UTF_8),
                            "HmacSHA256"
                    );

            mac.init(secretKeySpec);

            byte[] hash =
                    mac.doFinal(
                            data.getBytes(StandardCharsets.UTF_8)
                    );

            return HexFormat.of().formatHex(hash);

        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Cannot verify SePay signature"
            );
        }
    }

    private String extractDepositCode(
            String content
    ) {

        if (content == null || content.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Missing transfer content"
            );
        }

        Matcher matcher =
                DEPOSIT_CODE_PATTERN.matcher(content);

        if (!matcher.find()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Deposit code not found"
            );
        }

        return matcher.group();
    }

    public List<TransactionResponse> getMyDeposits(Long userId) {

        return transactionRepository
                .findByUserIdAndTypeOrderByCreatedAtDesc(
                        userId,
                        TransactionType.DEPOSIT
                )
                .stream()
                .map(this::mapTransaction)
                .toList();
    }

    public List<TransactionResponse> getAllTransactionsForAdmin() {

        return transactionRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapTransaction)
                .toList();
    }

    @Transactional
    public TransactionResponse approveTransaction(Long transactionId) {

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Transaction not found"
                ));

        if (transaction.getStatus() == TransactionStatus.SUCCESS) {
            return mapTransaction(transaction);
        }

        if (transaction.getStatus() == TransactionStatus.FAILED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot approve failed transaction"
            );
        }

        if (transaction.getType() != TransactionType.DEPOSIT) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only deposit transaction can be approved"
            );
        }

        User user = transaction.getUser();

        BigDecimal amountBefore = user.getBalance();
        BigDecimal amountAfter = amountBefore.add(transaction.getAmount());

        user.setBalance(amountAfter);
        userRepository.save(user);

        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setProvider("MANUAL");
        transaction.setDescription(
                transaction.getDescription() == null
                        ? "Manual deposit approved"
                        : transaction.getDescription() + " | Manual approved"
        );

        transactionRepository.save(transaction);

        UserBalanceLog balanceLog = UserBalanceLog.builder()
                .user(user)
                .amountBefore(amountBefore)
                .amountChange(transaction.getAmount())
                .amountAfter(amountAfter)
                .type("DEPOSIT")
                .description("Manual approve transaction: " + transaction.getTransactionCode())
                .build();

        balanceLogRepository.save(balanceLog);

        return mapTransaction(transaction);
    }

    @Transactional
    public TransactionResponse rejectTransaction(Long transactionId) {

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Transaction not found"
                ));

        if (transaction.getStatus() == TransactionStatus.SUCCESS) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot reject successful transaction"
            );
        }

        transaction.setStatus(TransactionStatus.FAILED);
        transaction.setDescription(
                transaction.getDescription() == null
                        ? "Manual deposit rejected"
                        : transaction.getDescription() + " | Manual rejected"
        );

        transactionRepository.save(transaction);

        return mapTransaction(transaction);
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