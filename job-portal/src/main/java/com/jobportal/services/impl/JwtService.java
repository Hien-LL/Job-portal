package com.jobportal.services.impl;

import com.jobportal.entities.RefreshToken;
import com.jobportal.repositories.BlacklistedTokenRepository;
import com.jobportal.repositories.RefreshTokenRepository;
import com.jobportal.securities.configs.JwtConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.function.Function;

@Service
public class JwtService {

    private final JwtConfig jwtConfig;
    private final Key key;
    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);
    private final BlacklistedTokenRepository blacklistedTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public JwtService(JwtConfig jwtConfig,
                      RefreshTokenRepository refreshTokenRepository,
                      BlacklistedTokenRepository blacklistedTokenRepository) {
        this.blacklistedTokenRepository = blacklistedTokenRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtConfig = jwtConfig;
        this.key = Keys.hmacShaKeyFor(Base64.getEncoder().encode(jwtConfig.getSecretKey().getBytes()));
    }

    public String generateToken(Long userId, String email, Long expirationTime) {
        logger.info("Generating...");
        Date now = new Date();

        if (expirationTime == null) {
            expirationTime = jwtConfig.getExpirationTime();
        }

        Date expiryDate = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
                .setSubject(email)
                .claim("uid", userId)
                .setIssuer(jwtConfig.getIssuer())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    public String generateRefreshToken(Long userId, String email) {
        logger.info("Generating refresh token...");
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtConfig.getRefreshTokenExpirationTime());

        String refreshToken = UUID.randomUUID().toString();

        LocalDateTime localExpiryDate = expiryDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();

        Optional<RefreshToken> optionalRefreshToken = refreshTokenRepository.findByUserId(userId);
        if (optionalRefreshToken.isPresent()) {
            RefreshToken dBRefreshToken = optionalRefreshToken.get();
            dBRefreshToken.setRefreshToken(refreshToken);
            dBRefreshToken.setExpiryDate(localExpiryDate);
            refreshTokenRepository.save(dBRefreshToken);
        } else {
            RefreshToken insertToken = new RefreshToken();
            insertToken.setRefreshToken(refreshToken);
            insertToken.setUserId(userId);
            insertToken.setExpiryDate(localExpiryDate);
            refreshTokenRepository.save(insertToken);
        }
        return refreshToken;
    }

    public boolean isTokenFormatValid(String token) {
        try {
            String[] tokenParts = token.split("\\.");
            return tokenParts.length == 3;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isSignatureValid(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Key getSigningKey() {
        byte[] keyBytes = jwtConfig.getSecretKey().getBytes();
        return Keys.hmacShaKeyFor(Base64.getEncoder().encode(keyBytes));
    }

    public boolean isTokenExpired(String token) {
        try {
            Date expiration = getClaimFromToken(token, Claims::getExpiration);
            return expiration.before(new Date());
        } catch (RuntimeException e) {
            return true;
        }
    }

    public Claims getAllClaimsFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            throw e;
        } catch (io.jsonwebtoken.security.SignatureException e) {
            logger.error("Lỗi chữ ký token: {}", e.getMessage());
            throw new RuntimeException("Chữ ký token không hợp lệ", e);
        } catch (io.jsonwebtoken.MalformedJwtException e) {
            logger.error("Lỗi định dạng token: {}", e.getMessage());
            throw new RuntimeException("Token không đúng định dạng", e);
        } catch (Exception e) {
            logger.error("Lỗi khi phân tích token: {}", e.getMessage());
            throw new RuntimeException("Lỗi không xác định khi phân tích token", e);
        }
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    public boolean isIssureToken(String token) {
        String tokenIssuer = getClaimFromToken(token, Claims::getIssuer);
        return jwtConfig.getIssuer().equals(tokenIssuer);
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
        return claims.getSubject();
    }

    public boolean isBlacklistedToken(String token) {
        return blacklistedTokenRepository.existsByToken(token);
    }

    public boolean isRefreshTokenValid(String token) {
        try {
            RefreshToken refreshToken = refreshTokenRepository.findByRefreshToken(token).orElseThrow(() ->
                    new RuntimeException("Refresh token không tồn tại"));

            LocalDateTime expirytionLocalDateTime = refreshToken.getExpiryDate();
            Date expirationDate = Date.from(expirytionLocalDateTime.atZone(ZoneId.systemDefault()).toInstant());
            return expirationDate.after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public String getStringClaim(String jwt, String roles) {
        Claims claims = getAllClaimsFromToken(jwt);
        Object claimObj = claims.get(roles);
        if (claimObj instanceof String) {
            return (String) claimObj;
        }
        return null;
    }

    public List<String> getStringListClaim(String jwt, String roles) {
        Claims claims = getAllClaimsFromToken(jwt);
        Object claimObj = claims.get(roles);
        if (claimObj instanceof List<?>) {
            List<?> rawList = (List<?>) claimObj;
            List<String> stringList = new ArrayList<>();
            for (Object obj : rawList) {
                if (obj instanceof String) {
                    stringList.add((String) obj);
                }
            }
            return stringList;
        }
        return null;
    }

    public Long getLongClaim(String jwt, String uid) {
        Claims claims = getAllClaimsFromToken(jwt);
        Object claimObj = claims.get(uid);
        if (claimObj instanceof Integer) {
            return ((Integer) claimObj).longValue();
        } else if (claimObj instanceof Long) {
            return (Long) claimObj;
        }
        return null;
    }
}
