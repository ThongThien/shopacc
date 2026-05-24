package com.shopacc.backend.dto.user;

import com.shopacc.backend.enums.UserRole;
import com.shopacc.backend.enums.UserStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class UserResponse {

    private Long id;

    private String username;

    private String email;

    private UserRole role;

    private UserStatus status;

    private BigDecimal balance;
}