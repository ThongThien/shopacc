package com.shopacc.backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ResetPasswordResponse {

    private String newPassword;
}