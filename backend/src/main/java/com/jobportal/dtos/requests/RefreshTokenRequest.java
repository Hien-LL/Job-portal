package com.jobportal.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefreshTokenRequest {
    @NotBlank(message = "RefeshToken khong duoc de trong")
    private String refreshToken;
}
