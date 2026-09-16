package com.shopacc.backend.dto.auth;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {

    private String accessToken;

    // Chỉ dùng nội bộ phía server để set cookie HttpOnly — không bao giờ serialize ra JSON
    @JsonIgnore
    private String refreshToken;

    private String role;
}