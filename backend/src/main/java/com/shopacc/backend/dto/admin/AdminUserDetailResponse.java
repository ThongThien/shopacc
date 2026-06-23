package com.shopacc.backend.dto.admin;

import com.shopacc.backend.dto.order.OrderResponse;
import com.shopacc.backend.enums.UserRole;
import com.shopacc.backend.enums.UserStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class AdminUserDetailResponse {

    private Long id;

    private String username;

    private String email;

    private UserRole role;

    private UserStatus status;

    private BigDecimal balance;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<OrderResponse> orders;
}