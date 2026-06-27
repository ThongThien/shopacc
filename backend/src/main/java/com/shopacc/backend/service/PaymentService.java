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

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

        private static final Pattern DEPOSIT_CODE_PATTERN = Pattern.compile("DH[a-fA-F0-9]+");

        private final UserRepository userRepository;

        private final TransactionRepository transactionRepository;

        private final UserBalanceLogRepository balanceLogRepository;

        private final ObjectMapper objectMapper;

        private final PaymentWebhookLogRepository webhookLogRepository;

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

        public String buildVietQrUrl(BigDecimal amount, String transferContent) {
                String encodedAccountName = java.net.URLEncoder.encode(
                                vietqrAccountName,
                                StandardCharsets.UTF_8);
                String encodedContent = java.net.URLEncoder.encode(
                                transferContent, StandardCharsets.UTF_8);
                return "https://img.vietqr.io/image/"
                                + vietqrBankId
                                + "-"
                                + vietqrAccountNo
                                + "-print.png"
                                + "?amount="
                                + amount.toBigInteger()
                                + "&addInfo="
                                + encodedContent
                                + "&accountName="
                                + encodedAccountName;

        }

        public DepositResponse createDeposit(
                        Long userId,
                        CreateDepositRequest request) {

                if (request.getAmount() == null ||
                                request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {

                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Deposit amount must be greater than 0");
                }

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "User not found"));
                String transactionCode = "DH" + java.util.UUID.randomUUID().toString().replace("-", "");

                String qrUrl = buildVietQrUrl(request.getAmount(), transactionCode);

                Transaction transaction = Transaction.builder()
                                .user(user)
                                .transactionCode(transactionCode)
                                .type(TransactionType.DEPOSIT)
                                .amount(request.getAmount())
                                .status(TransactionStatus.PENDING)
                                .provider("SEPAY")
                                .bankAccount(vietqrAccountNo)
                                .expiredAt(java.time.LocalDateTime.now().plusMinutes(30))
                                .description("Pending bank deposit")
                                .build();

                transactionRepository.save(transaction);

                return DepositResponse.builder()
                                .transactionCode(transactionCode)
                                .amount(transaction.getAmount())
                                .status(transaction.getStatus())
                                .transferContent(transactionCode)
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

                verifySepaySignature(rawBody, signature, timestamp);

                SepayWebhookRequest request;
                PaymentWebhookLog webhookLog;

                try {
                        request = objectMapper.readValue(rawBody, SepayWebhookRequest.class);

                        log.info("[SEPAY] RAW_BODY: {}", rawBody);
                        log.info("[SEPAY] AMOUNT: {}", request.getTransferAmount());
                        log.info("[SEPAY] CONTENT: {}", request.getContent());
                        log.info("[SEPAY] REF: {}", request.getReferenceCode());

                } catch (Exception e) {
                        log.error("[SEPAY][ERROR] Invalid payload: {}", e.getMessage(), e);
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid SePay payload");
                }

                // ===================== VALIDATION =====================

                if (request.getTransferAmount() == null ||
                                request.getTransferAmount().compareTo(BigDecimal.ZERO) <= 0) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid transfer amount");
                }

                if (request.getCurrency() != null &&
                                !"VND".equalsIgnoreCase(request.getCurrency())) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported currency");
                }

                if (request.getGateway() != null &&
                                !("VietinBank".equalsIgnoreCase(request.getGateway())
                                                || "ICB".equalsIgnoreCase(request.getGateway()))) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported gateway");
                }

                // ===================== INIT WEBHOOK LOG =====================

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

                // ===================== ACCOUNT CHECK =====================

                if (request.getAccountNumber() == null ||
                                !request.getAccountNumber().equals(vietqrAccountNo)) {

                        webhookLog.setStatus("FAILED");
                        webhookLog.setErrorMessage("Invalid receiving account");
                        webhookLogRepository.save(webhookLog);

                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid receiving account");
                }

                // ===================== TRANSFER TYPE =====================

                if (!"in".equalsIgnoreCase(request.getTransferType())) {

                        webhookLog.setStatus("IGNORED");
                        webhookLog.setErrorMessage("Transfer type is not IN");
                        webhookLogRepository.save(webhookLog);

                        return;
                }

                // ===================== FIND TRANSACTION =====================

                String transactionCode = extractDepositCode(request.getContent());

                Transaction transaction = transactionRepository
                                .findByTransactionCodeForUpdate(transactionCode)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Deposit transaction not found"));

                // ===================== IDLE / STATE CHECK =====================

                if (transaction.getStatus() != TransactionStatus.PENDING) {

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

                        log.warn("[SEPAY][EXPIRED] txCode={} expiredAt={}",
                                        transaction.getTransactionCode(),
                                        transaction.getExpiredAt());

                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transaction expired");
                }

                // ===================== DUPLICATE PROTECTION =====================
                // (DB UNIQUE still required, this is just extra safety)

                if (transaction.getProviderTransactionId() != null &&
                                transaction.getProviderTransactionId().equals(request.getReferenceCode())) {

                        webhookLog.setStatus("IGNORED");
                        webhookLog.setErrorMessage("Duplicate webhook");
                        webhookLogRepository.save(webhookLog);

                        return;
                }

                transaction.setProviderTransactionId(request.getReferenceCode());

                // ===================== AMOUNT CHECK =====================

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

                        log.warn("[SEPAY][AMOUNT_MISMATCH] expected={} actual={} txCode={}",
                                        transaction.getAmount(),
                                        request.getTransferAmount(),
                                        transaction.getTransactionCode());

                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount mismatch");
                }

                // ===================== BALANCE UPDATE (ATOMIC) =====================

                User user = userRepository.findByIdForUpdate(transaction.getUser().getId())
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "User not found"));

                BigDecimal amountBefore = user.getBalance();

                BigDecimal amount = transaction.getAmount();

                BigDecimal amountAfter = amountBefore.add(amount);

                user.setBalance(amountAfter);

                userRepository.save(user);

                log.info("[SEPAY][SUCCESS] balance updated | userId={} | before={} | after={} | amount={} | txCode={}",
                                user.getId(),
                                amountBefore,
                                amountAfter,
                                amount,
                                transaction.getTransactionCode());

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

                log.info("[SEPAY][SUCCESS] transaction completed | txCode={} | ref={}",
                                transaction.getTransactionCode(),
                                request.getReferenceCode());

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

                // ===================== WEBHOOK FINAL =====================

                webhookLog.setStatus("PROCESSED");
                webhookLogRepository.save(webhookLog);

                log.info("[SEPAY][DONE] webhook processed | ref={} | txCode={}",
                                request.getReferenceCode(),
                                transaction.getTransactionCode());
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

                if (signature == null || timestamp == null) {
                        throw new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "Missing signature");
                }

                long requestTime;
                try {
                        requestTime = Long.parseLong(timestamp);
                } catch (NumberFormatException e) {
                        throw new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "Invalid timestamp");
                }

                long now = System.currentTimeMillis() / 1000;

                if (timestamp.length() == 13) {
                        requestTime = requestTime / 1000;
                }

                if (Math.abs(now - requestTime) > 300) {
                        throw new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "Expired webhook");
                }

                String expected = hmacSha256Hex(
                                timestamp + "." + rawBody,
                                sepaySecretKey);

                // normalize signature (IMPORTANT)
                String cleanSignature = signature
                                .replace("sha256=", "")
                                .trim();

                if (!MessageDigest.isEqual(
                                expected.getBytes(StandardCharsets.UTF_8),
                                cleanSignature.getBytes(StandardCharsets.UTF_8))) {

                        System.out.println("EXPECTED = " + expected);
                        System.out.println("RECEIVED = " + cleanSignature);

                        throw new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "Invalid signature");
                }
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

                return matcher.group().replace("-", "");
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