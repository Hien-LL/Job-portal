package com.jobportal.services.impl;

import com.jobportal.dtos.requests.BlacklistTokenRequest;
import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.entities.BlacklistedToken;
import com.jobportal.mappers.BlacklistedTokenMapper;
import com.jobportal.repositories.BlacklistedTokenRepository;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;

@RequiredArgsConstructor
@Service
public class BlacklistedService {
    private final BlacklistedTokenRepository blacklistedTokenRepository;
    private final JwtService jwtService;
    private final BlacklistedTokenMapper blackListedTokenMapper;
    private static final Logger logger = LoggerFactory.getLogger(BlacklistedService.class);

    public Object create(BlacklistTokenRequest request) {
        try {
            if (blacklistedTokenRepository.existsByToken(request.getToken())) {
                return ApiResource.error("TOKEN_ALREADY_EXISTS", "Token da ton tai trong blacklist", HttpStatus.BAD_REQUEST);
            }
            Claims claims = jwtService.getAllClaimsFromToken(request.getToken());

            Long userId = Long.valueOf(claims.get("uid").toString());
            LocalDateTime expiryDate = claims.getExpiration()
                    .toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();

            BlacklistedToken blacklistedToken = blackListedTokenMapper.toEntity(
                    request.getToken(),
                    userId,
                    expiryDate
            );
            blacklistedTokenRepository.save(blacklistedToken);
            logger.info("Them token token vao blacklist thanh cong");
            return ApiResource.ok(null, "Them token vao blacklist thanh cong");

        } catch (Exception e) {
            return ApiResource.error("TOKEN_ALREADY_EXISTS", e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
