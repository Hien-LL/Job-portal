package com.jobportal.dtos.resources;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
@AllArgsConstructor
public class RefreshTokenResource {
    private String token;
    private String refreshToken;
}
