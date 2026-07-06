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
import com.shopacc.backend.repository.PaymentWebhookLogRepository;
import com.shopacc.backend.repository.TransactionRepository;
import com.shopacc.backend.repository.UserBalanceLogRepository;
import com.shopacc.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import com.shopacc.backend.entity.PaymentWebhookLog;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import com.shopacc.backend.dto.user.TransactionResponse;
import lombok.extern.slf4j.Slf4j;
import java.util.List;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

        // SePay VA content: "SEVQR <vaPrefix> <token>", e.g. "SEVQR TKP753 abc123..."
        // DB lưu nguyên cả chuỗi "SEVQR TKP753 <token>"
        private static final Pattern DEPOSIT_CODE_PATTERN = Pattern.compile("SEVQR\\s+\\S+\\s+([A-Za-z0-9]{3,64})");

        private final UserRepository userRepository;

        private final TransactionRepository transactionRepository;

        private final UserBalanceLogRepository balanceLogRepository;

        private final ObjectMapper objectMapper;

        private final PaymentWebhookLogRepository webhookLogRepository;

        private final NotificationService notificationService;

        @Value("${VIETQR_BANK_ID}")
        private String vietqrBankId;

        @Value("${VIETQR_ACCOUNT_NO}")
        private String vietqrAccountNo;

        @Value("${VIETQR_BANK_NAME}")
        private String vietqrBankName;

        @Value("${VIETQR_ACCOUNT_NAME}")
        private String vietqrAccountName;

        @Value("${SEPAY_SECRET_KEY}")
        private String sepaySecretKey;

        @Value("${SEPAY_VA_PREFIX}")
        private String sepayVaPrefix;

        private String buildSepayQrUrl(
                        BigDecimal amount,
                        String transferContent) {

                return UriComponentsBuilder
                                .fromHttpUrl("https://vietqr.app/img")
                                .queryParam("acc", vietqrAccountNo)
                                .queryParam("bank", vietqrBankName)
                                .queryParam("amount", amount.toPlainString())
                                .queryParam("des", transferContent)
                                .queryParam("template", "compact")
                                .queryParam("showinfo", "true")
                                .queryParam("holder", vietqrAccountName)
                                .build()
                                .toUriString();
        }

        public DepositResponse createDeposit(
                        Long userId,
                        CreateDepositRequest request) {

                // =========================
                // Validate request
                // =========================
                if (request.getAmount() == null
                                || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {

                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Deposit amount must be greater than 0");
                }

                // =========================
                // Find user
                // =========================
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "User not found"));

                // =========================
                // Generate unique transaction code
                // =========================
                // SePay sẽ trả lại content chứa transactionCode này trong webhook.
                String token = UUID.randomUUID()
                                .toString()
                                .replace("-", "");

                String transactionCode = "SEVQR " + sepayVaPrefix + " " + token;

                // =========================
                // Build SePay QR URL
                // =========================
                String qrUrl = buildSepayQrUrl(
                                request.getAmount(),
                                transactionCode);

                // =========================
                // Save transaction
                // =========================
                Transaction transaction = Transaction.builder()
                                .user(user)
                                .transactionCode(transactionCode)
                                .type(TransactionType.DEPOSIT)
                                .amount(request.getAmount())
                                .status(TransactionStatus.PENDING)
                                .provider("SEPAY")
                                .bankAccount(vietqrAccountNo)
                                .expiredAt(LocalDateTime.now().plusMinutes(30))
                                .description("Pending SePay deposit")
                                .build();

                transactionRepository.save(transaction);

                // =========================
                // Log
                // =========================
                log.info(
                                "[SEPAY] Deposit created | userId={} | transactionCode={} | amount={}",
                                user.getId(),
                                transaction.getTransactionCode(),
                                transaction.getAmount());

                // =========================
                // Response
                // =========================
                return DepositResponse.builder()
                                .transactionCode(transaction.getTransactionCode())
                                .amount(transaction.getAmount())
                                .status(transaction.getStatus())
                                .transferContent(transaction.getTransactionCode())
                                .qrUrl(qrUrl)
                                .bankName(vietqrBankName)
                                .accountName(vietqrAccountName)
                                .bankAccount(vietqrAccountNo)
                                .build();
        }

        @Transactional
        public void handleSepayWebhook(
                        String rawBody,
                        String signature,
                        String timestamp) {
                try {
                        // Only throw for HMAC verification failure
                        verifySepaySignature(rawBody, signature, timestamp);
                        log.info("[SEPAY] Webhook received");
                        SepayWebhookRequest request;
                        PaymentWebhookLog webhookLog;

                        // Only throw for JSON parse / missing required fields
                        try {
                                request = objectMapper.readValue(rawBody, SepayWebhookRequest.class);
                                log.info(
                                                "[SEPAY] Parsed | id={} | ref={} | amount={} | type={}",
                                                request.getId(),
                                                request.getReferenceCode(),
                                                request.getTransferAmount(),
                                                request.getTransferType());
                        } catch (Exception e) {
                                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid SePay payload");
                        }

                        // ===================== INIT WEBHOOK LOG =====================
                        // Save immediately so we have trace even if business validation fails.
                        webhookLog = PaymentWebhookLog.builder()
                                        .provider("SEPAY")
                                        .referenceCode(request.getReferenceCode())
                                        .accountNumber(request.getAccountNumber())
                                        .transferType(request.getTransferType())
                                        .transferAmount(request.getTransferAmount())
                                        .content(request.getContent())
                                        .rawBody(rawBody)
                                        .status("RECEIVED")
                                        .build();
                        webhookLogRepository.save(webhookLog);

                        // ===================== BUSINESS VALIDATION (NO THROW) =====================
                        if (request.getTransferAmount() == null ||
                                        request.getTransferAmount().compareTo(BigDecimal.ZERO) <= 0) {
                                webhookLog.setStatus("FAILED");
                                webhookLog.setErrorMessage("Invalid transfer amount");
                                webhookLogRepository.save(webhookLog);
                                return;
                        }

                        if (request.getCurrency() != null &&
                                        !"VND".equalsIgnoreCase(request.getCurrency())) {
                                webhookLog.setStatus("FAILED");
                                webhookLog.setErrorMessage("Unsupported currency");
                                webhookLogRepository.save(webhookLog);
                                return;
                        }

                        if (request.getGateway() != null &&
                                        !("VietinBank".equalsIgnoreCase(request.getGateway())
                                                        || "ICB".equalsIgnoreCase(request.getGateway()))) {
                                webhookLog.setStatus("FAILED");
                                webhookLog.setErrorMessage("Unsupported gateway");
                                webhookLogRepository.save(webhookLog);
                                return;
                        }

                        // ===================== ACCOUNT CHECK (NO THROW) =====================
                        if (request.getAccountNumber() == null ||
                                        !request.getAccountNumber().equals(vietqrAccountNo)) {
                                webhookLog.setStatus("FAILED");
                                webhookLog.setErrorMessage("Invalid receiving account");
                                webhookLogRepository.save(webhookLog);
                                return;
                        }

                        // ===================== TRANSFER TYPE (NO THROW) =====================
                        if (!"in".equalsIgnoreCase(request.getTransferType())) {
                                webhookLog.setStatus("IGNORED");
                                webhookLog.setErrorMessage("Transfer type is not IN");
                                webhookLogRepository.save(webhookLog);
                                return;
                        }

                        // ===================== FIND TRANSACTION =====================
                        String transactionCode;
                        try {
                                transactionCode = extractDepositCode(request.getContent());
                        } catch (Exception ex) {
                                webhookLog.setStatus("FAILED");
                                webhookLog.setErrorMessage(
                                                ex.getMessage() != null ? ex.getMessage() : "Deposit code not found");
                                webhookLogRepository.save(webhookLog);
                                return;
                        }

                        Transaction transaction = transactionRepository
                                        .findByTransactionCodeForUpdate(transactionCode)
                                        .orElse(null);

                        if (transaction == null) {
                                webhookLog.setStatus("FAILED");
                                webhookLog.setErrorMessage("Deposit transaction not found");
                                webhookLogRepository.save(webhookLog);
                                return;
                        }
                        log.info(
                                        "[SEPAY] Transaction found | code={} | status={}",
                                        transaction.getTransactionCode(),
                                        transaction.getStatus());
                        // ===================== IDLE / STATE CHECK =====================
                        if (transaction.getStatus() == TransactionStatus.SUCCESS) {
                                // Check duplicate first
                                if (transaction.getProviderTransactionId() != null &&
                                                transaction.getProviderTransactionId().equals(request.getReferenceCode())) {
                                        webhookLog.setStatus("IGNORED");
                                        webhookLog.setErrorMessage("Duplicate webhook");
                                        webhookLogRepository.save(webhookLog);
                                        return;
                                }

                                // New payment with same QR → create fresh transaction
                                Transaction extraTx = Transaction.builder()
                                                .user(transaction.getUser())
                                                .transactionCode(transaction.getTransactionCode()
                                                                + " #" + System.currentTimeMillis() / 1000)
                                                .type(TransactionType.DEPOSIT)
                                                .amount(request.getTransferAmount())
                                                .status(TransactionStatus.PENDING)
                                                .provider("SEPAY")
                                                .bankAccount(vietqrAccountNo)
                                                .expiredAt(LocalDateTime.now().plusMinutes(30))
                                                .description("Extra payment via same QR | orig="
                                                                + transaction.getTransactionCode())
                                                .build();
                                transaction = transactionRepository.save(extraTx);
                                log.info(
                                                "[SEPAY] Extra payment created | code={} | ref={} | amount={}",
                                                transaction.getTransactionCode(),
                                                request.getReferenceCode(),
                                                request.getTransferAmount());
                                // fall through to amount & balance update
                        } else if (transaction.getStatus() != TransactionStatus.PENDING) {
                                webhookLog.setStatus("IGNORED");
                                webhookLog.setErrorMessage("Transaction not PENDING: " + transaction.getStatus());
                                webhookLogRepository.save(webhookLog);
                                return;
                        }

                        // ===================== EXPIRED CHECK =====================
                        if (transaction.getExpiredAt() != null &&
                                        transaction.getExpiredAt().isBefore(LocalDateTime.now())) {
                                transaction.setStatus(TransactionStatus.EXPIRED);
                                transaction.setDescription("Expired before webhook");
                                transactionRepository.save(transaction);

                                webhookLog.setStatus("FAILED");
                                webhookLog.setErrorMessage("Transaction expired");
                                webhookLogRepository.save(webhookLog);
                                return;
                        }

                        // ===================== DUPLICATE PROTECTION =====================
                        if (transaction.getProviderTransactionId() != null &&
                                        transaction.getProviderTransactionId().equals(request.getReferenceCode())) {
                                webhookLog.setStatus("IGNORED");
                                webhookLog.setErrorMessage("Duplicate webhook");
                                webhookLogRepository.save(webhookLog);
                                log.info(
                                                "[SEPAY] Duplicate webhook | ref={}",
                                                request.getReferenceCode());
                                return;
                        }

                        // ===================== AMOUNT CHECK (NO THROW) =====================
                        if (transaction.getAmount().compareTo(request.getTransferAmount()) != 0) {
                                transaction.setStatus(TransactionStatus.NEED_REVIEW);
                                transaction.setGateway(request.getGateway());
                                transaction.setDescription(
                                                "AMOUNT_MISMATCH expected=" + transaction.getAmount()
                                                                + " actual=" + request.getTransferAmount()
                                                                + " content=" + request.getContent());
                                transactionRepository.save(transaction);

                                webhookLog.setStatus("NEED_REVIEW");
                                webhookLog.setErrorMessage("Amount mismatch");
                                webhookLogRepository.save(webhookLog);
                                log.warn(
                                                "[SEPAY] Amount mismatch | expected={} | actual={} | tx={}",
                                                transaction.getAmount(),
                                                request.getTransferAmount(),
                                                transaction.getTransactionCode());
                                return;
                        }

                        // ===================== BALANCE UPDATE (ATOMIC) =====================
                        User user = userRepository.findByIdForUpdate(transaction.getUser().getId())
                                        .orElse(null);
                        if (user == null) {
                                webhookLog.setStatus("FAILED");
                                webhookLog.setErrorMessage("User not found");
                                webhookLogRepository.save(webhookLog);
                                return;
                        }

                        BigDecimal amountBefore = user.getBalance();
                        BigDecimal amount = transaction.getAmount();
                        BigDecimal amountAfter = amountBefore.add(amount);

                        user.setBalance(amountAfter);
                        userRepository.save(user);

                        // ===================== TRANSACTION UPDATE =====================
                        transaction.setStatus(TransactionStatus.SUCCESS);
                        transaction.setProviderTransactionId(request.getReferenceCode());
                        transaction.setGateway(request.getGateway());
                        transaction.setBankAccount(request.getAccountNumber());
                        transaction.setDescription(
                                        "SePay deposit success: " +
                                                        (request.getDescription() != null
                                                                        ? request.getDescription()
                                                                        : request.getContent()));
                        transactionRepository.save(transaction);
                        log.info(
                                        "[SEPAY] Deposit success | user={} | amount={} | tx={}",
                                        user.getId(),
                                        amount,
                                        transaction.getTransactionCode());

                        // ===================== BALANCE LOG =====================
                        UserBalanceLog balanceLog = UserBalanceLog.builder()
                                        .user(user)
                                        .amountBefore(amountBefore)
                                        .amountChange(amount)
                                        .amountAfter(amountAfter)
                                        .type("DEPOSIT")
                                        .description("SePay deposit: " + transaction.getTransactionCode())
                                        .build();
                        balanceLogRepository.save(balanceLog);
                notificationService.pushBalance(transaction.getUser().getId(),
                                Map.of("balance", amountAfter, "username", user.getUsername()));

                        // ===================== WEBHOOK FINAL =====================
                        webhookLog.setStatus("PROCESSED");
                        webhookLog.setErrorMessage(null);
                        webhookLogRepository.save(webhookLog);

                } catch (Exception e) {
                        // Only throw for unexpected/DB exceptions to trigger retry (5xx)
                        log.error("[SEPAY][FATAL]", e);
                        throw e;
                }
        }

        public TransactionResponse getDepositByCode(
                        Long userId,
                        String transactionCode) {
                Transaction transaction = transactionRepository
                                .findByTransactionCodeForUpdate(transactionCode)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Deposit transaction not found"));

                if (!transaction.getUser().getId().equals(userId)) {
                        throw new ResponseStatusException(
                                        HttpStatus.FORBIDDEN,
                                        "You cannot view this transaction");
                }

                if (transaction.getType() != TransactionType.DEPOSIT) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Transaction is not a deposit");
                }

                return mapTransaction(transaction);
        }

        private void verifySepaySignature(
                        String rawBody,
                        String signature,
                        String timestamp) {
                System.out.println("========== VERIFY SIGNATURE ==========");
                System.out.println("Timestamp Header = " + timestamp);
                System.out.println("Signature Header = " + signature);

                if (signature == null || timestamp == null) {
                        throw new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "Missing signature");
                }

                long requestTime;
                try {
                        requestTime = Long.parseLong(timestamp);
                        System.out.println("Parsed timestamp = " + requestTime);
                } catch (NumberFormatException e) {
                        throw new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "Invalid timestamp");
                }

                long now = System.currentTimeMillis() / 1000;
                System.out.println("Server time = " + now);

                if (timestamp.length() == 13) {
                        requestTime = requestTime / 1000;
                }
                System.out.println("Normalized requestTime = " + requestTime);

                if (Math.abs(now - requestTime) > 300) {
                        throw new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "Expired webhook");
                }
                System.out.println("Generating HMAC...");

                String expected = hmacSha256Hex(
                                timestamp + "." + rawBody,
                                sepaySecretKey);
                System.out.println("Expected = " + expected);
                // normalize signature (IMPORTANT)
                String cleanSignature = signature
                                .replace("sha256=", "")
                                .trim();
                System.out.println("Received = " + cleanSignature);
                if (!MessageDigest.isEqual(
                                expected.getBytes(StandardCharsets.UTF_8),
                                cleanSignature.getBytes(StandardCharsets.UTF_8))) {

                        System.out.println("EXPECTED = " + expected);
                        System.out.println("RECEIVED = " + cleanSignature);

                        throw new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "Invalid signature");
                }
                System.out.println("✅ Signature matched");
        }

        private String hmacSha256Hex(
                        String data,
                        String secret) {

                try {
                        Mac mac = Mac.getInstance("HmacSHA256");

                        SecretKeySpec secretKeySpec = new SecretKeySpec(
                                        secret.getBytes(StandardCharsets.UTF_8),
                                        "HmacSHA256");

                        mac.init(secretKeySpec);

                        byte[] hash = mac.doFinal(
                                        data.getBytes(StandardCharsets.UTF_8));

                        return HexFormat.of().formatHex(hash);

                } catch (Exception e) {
                        throw new ResponseStatusException(
                                        HttpStatus.INTERNAL_SERVER_ERROR,
                                        "Cannot verify SePay signature");
                }
        }

        private String extractDepositCode(String content) {

                if (content == null || content.isBlank()) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Missing transfer content");
                }

                Matcher matcher = DEPOSIT_CODE_PATTERN.matcher(content);

                if (!matcher.find()) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Deposit code not found");
                }

                // Trả về đúng format đang lưu trong DB: "SEVQR <vaPrefix> <token>"
                String token = matcher.group(1);
                return "SEVQR " + sepayVaPrefix + " " + token;
        }

        public List<TransactionResponse> getMyDeposits(Long userId) {

                return transactionRepository
                                .findByUserIdAndTypeOrderByCreatedAtDesc(
                                                userId,
                                                TransactionType.DEPOSIT)
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
                                                "Transaction not found"));

                if (transaction.getStatus() == TransactionStatus.SUCCESS) {
                        return mapTransaction(transaction);
                }

                if (transaction.getStatus() == TransactionStatus.FAILED) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Cannot approve failed transaction");
                }

                if (transaction.getType() != TransactionType.DEPOSIT) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Only deposit transaction can be approved");
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
                                                : transaction.getDescription() + " | Manual approved");

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
                notificationService.pushBalance(transaction.getUser().getId(),
                                Map.of("balance", amountAfter, "username", user.getUsername()));

                return mapTransaction(transaction);
        }

        @Transactional
        public TransactionResponse rejectTransaction(Long transactionId) {

                Transaction transaction = transactionRepository.findById(transactionId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Transaction not found"));

                if (transaction.getStatus() == TransactionStatus.SUCCESS) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Cannot reject successful transaction");
                }

                transaction.setStatus(TransactionStatus.FAILED);
                transaction.setDescription(
                                transaction.getDescription() == null
                                                ? "Manual deposit rejected"
                                                : transaction.getDescription() + " | Manual rejected");

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
                                .userId(transaction.getUser().getId())
                                .username(transaction.getUser().getUsername())
                                .email(transaction.getUser().getEmail())
                                .build();
        }

}