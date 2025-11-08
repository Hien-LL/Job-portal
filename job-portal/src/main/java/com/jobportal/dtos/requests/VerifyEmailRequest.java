package com.jobportal.dtos.requests;

import lombok.Data;

@Data
public class VerifyEmailRequest {
    private String email;
    private String otp;
}
