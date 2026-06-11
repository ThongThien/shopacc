package com.shopacc.backend.service;

import com.shopacc.backend.entity.AuditLog;
import com.shopacc.backend.entity.User;
import com.shopacc.backend.enums.AuditAction;
import com.shopacc.backend.repository.AuditLogRepository;
import com.shopacc.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    private final UserRepository userRepository;

    public void log(
            Long userId,
            AuditAction action,
            String metadata,
            HttpServletRequest request) {

        User user = null;

        if (userId != null) {
            user = userRepository.findById(userId)
                    .orElse(null);
        }

        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action(action)
                .ipAddress(resolveClientIp(request))
                .metadata(metadata)
                .build();

        auditLogRepository.save(auditLog);
    }

    private String resolveClientIp(HttpServletRequest request) {

        if (request == null) {
            return null;
        }

        String forwardedFor = request.getHeader("X-Forwarded-For");

        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }

        String realIp = request.getHeader("X-Real-IP");

        if (realIp != null && !realIp.isBlank()) {
            return realIp;
        }

        return request.getRemoteAddr();
    }
}