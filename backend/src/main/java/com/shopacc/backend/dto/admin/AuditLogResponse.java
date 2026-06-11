package com.shopacc.backend.dto.admin;

import com.shopacc.backend.enums.AuditAction;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AuditLogResponse {

    private Long id;

    private Long userId;

    private String username;

    private AuditAction action;

    private String metadata;

    private String ipAddress;

    private LocalDateTime createdAt;
}