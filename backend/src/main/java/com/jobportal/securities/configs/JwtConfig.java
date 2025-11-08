package com.jobportal.securities.configs;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Getter
@Configuration
public class JwtConfig {
    @Value("${jwt.secret}") private String secretKey;
    @Value("${jwt.expiration}") private long expirationTime;
    @Value("${jwt.expirationRefreshToken}") private long refreshTokenExpirationTime;
    @Value("${jwt.issuer}") private String issuer;
}
