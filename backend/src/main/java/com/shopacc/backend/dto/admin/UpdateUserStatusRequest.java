package com.shopacc.backend.dto.admin;

import com.shopacc.backend.enums.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserStatusRequest {

    @NotNull(message = "status is required")
    private UserStatus status;
}