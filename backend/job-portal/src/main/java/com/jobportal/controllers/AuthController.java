package com.jobportal.controllers;

import com.jobportal.dtos.requests.*;
import com.jobportal.dtos.resources.*;
import com.jobportal.entities.RefreshToken;
import com.jobportal.repositories.RefreshTokenRepository;
import com.jobportal.services.impl.BlacklistedService;
import com.jobportal.services.impl.JwtService;
import com.jobportal.services.interfaces.AuthServiceInterface;
import com.jobportal.services.interfaces.NotificationServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin(origins = "*")
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("api/auth")
public class AuthController {
    private final AuthServiceInterface userService;
    private final BlacklistedService blacklistedService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final NotificationServiceInterface notificationService;

    @PostMapping("register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            Object result = userService.createUser(registerRequest);
            if (result instanceof RegisterResource resource) {
                ApiResource<RegisterResource> response = ApiResource.ok(resource, "Đăng kí thành công");
                return ResponseEntity.ok(response);
            }
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResource.error("INTERNAL_SERVER_ERROR", "Network Error", HttpStatus.INTERNAL_SERVER_ERROR
                ));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verify(@RequestBody @Valid VerifyEmailRequest req){
        try {
            userService.verifyEmail(req.getEmail(), req.getOtp());
            ApiResource<Void> response = ApiResource.ok(null, "Xác thực email thành công");
            NotificationRequest notificationRequest = NotificationRequest.builder()
                    .title("Welcome Back!")
                    .body("Chào mừng bạn đã quay trở lại trang JobPortal.")
                    .build();

            String email = req.getEmail();
            Long userId = userService.getUserFromEmail(email).getId();
            notificationService.sendNotification(userId, notificationRequest);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResource.error("BAD_REQUEST", e.getMessage(), HttpStatus.BAD_REQUEST));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR
                    ));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resend(@RequestBody @Valid VerifyEmailRequest req){
        try {
            userService.resendOtp(req.getEmail());
            ApiResource<Void> response = ApiResource.ok(null, "Gửi lại mã OTP thành công");
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResource.error("BAD_REQUEST", e.getMessage(), HttpStatus.BAD_REQUEST));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR
                    ));
        }
    }

    @PostMapping("login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Object result = userService.authenticate(request);
        if (result instanceof LoginResource loginResource) {
            ApiResource<LoginResource> response = ApiResource.ok(loginResource, "SUCCESS");
            return ResponseEntity.ok(response);
        }

        if (result instanceof ApiResource errorResource) {
            return ResponseEntity.unprocessableEntity().body(errorResource);
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResource.error("INTERNAL_SERVER_ERROR", "Network Error", HttpStatus.INTERNAL_SERVER_ERROR
                ));
    }

    @PostMapping("blacklisted_tokens")
    public ResponseEntity<?> addTokenToBlacklist(@Valid @RequestBody BlacklistTokenRequest request) {
        try {
            Object result = blacklistedService.create(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR
                    ));
        }
    }

    @GetMapping("logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String bearerToken) {
        try {
            String token = bearerToken.substring(7);
            BlacklistTokenRequest request = new BlacklistTokenRequest();
            request.setToken(token);
            blacklistedService.create(request);
            ApiResource<Void> response = ApiResource.ok(null, "Đăng xuất thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR
                    ));
        }
    }



    @PostMapping("refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        if (!jwtService.isRefreshTokenValid(refreshToken)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("BAD_REQUEST", "RefreshToken không hợp lệ", HttpStatus.BAD_REQUEST));

        }

        Optional<RefreshToken> dbRefreshToken = refreshTokenRepository.findByRefreshToken(refreshToken);

        if (dbRefreshToken.isPresent()) {
            Long userId = dbRefreshToken.get().getUserId();
            String email = dbRefreshToken.get().getUser().getEmail();

            String newToken = jwtService.generateToken(userId, email, null);
            String newRefreshToken =jwtService.generateRefreshToken(userId, email);
            ApiResource<LoginResource> response = ApiResource.ok(
                    new LoginResource(newToken, newRefreshToken, new AuthResource(userId)),
                    "Làm mới token thành công"
            );
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResource.error("INTERNAL_SERVER_ERROR", "Có lỗi gì đó xảy ra ", HttpStatus.INTERNAL_SERVER_ERROR
                ));
    }
}

