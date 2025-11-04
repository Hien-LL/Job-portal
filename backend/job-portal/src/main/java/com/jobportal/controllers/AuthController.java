package com.jobportal.controllers;

import com.jobportal.dtos.requests.*;
import com.jobportal.dtos.resources.*;
import com.jobportal.entities.RefreshToken;
import com.jobportal.repositories.RefreshTokenRepository;
import com.jobportal.securities.exceptions.BusinessException;
import com.jobportal.services.impl.BlacklistedService;
import com.jobportal.services.impl.JwtService;
import com.jobportal.services.interfaces.AuthServiceInterface;
import com.jobportal.services.interfaces.NotificationServiceInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    public ApiResource<RegisterResource> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        // Gợi ý: đổi service trả thẳng RegisterResource. Nếu chưa đổi, tạm cast cứng và fail rõ ràng.
        Object result = userService.createUser(registerRequest);
        if (result instanceof RegisterResource resource) {
            return ApiResource.ok(resource, "Đăng kí thành công");
        }
        throw new BusinessException("REGISTER_FAILED", "Không thể đăng ký người dùng", HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @PostMapping("/verify-email")
    public ApiResource<Void> verify(@RequestBody @Valid VerifyEmailRequest req) {
        userService.verifyEmail(req.getEmail(), req.getOtp());

        // thông báo welcome
        var notificationRequest = NotificationRequest.builder()
                .title("Welcome Back!")
                .body("Chào mừng bạn đã quay trở lại trang JobPortal.")
                .build();
        Long userId = userService.getUserFromEmail(req.getEmail()).getId();
        notificationService.sendNotification(userId, notificationRequest);

        return ApiResource.ok(null, "Xác thực email thành công");
    }

    @PostMapping("/resend-otp")
    public ApiResource<Void> resend(@RequestBody @Valid VerifyEmailRequest req) {
        userService.resendOtp(req.getEmail());
        return ApiResource.ok(null, "Gửi lại mã OTP thành công");
    }

    @PostMapping("login")
    public ApiResource<LoginResource> login(@Valid @RequestBody LoginRequest request) {
        LoginResource loginResource = userService.authenticate(request);
        return ApiResource.ok(loginResource, "SUCCESS");
    }

    @PostMapping("blacklisted_tokens")
    public ApiResource<?> addTokenToBlacklist(@Valid @RequestBody BlacklistTokenRequest request) {
        var result = blacklistedService.create(request);
        return ApiResource.ok(result, "Đã thêm token vào blacklist");
    }

    // Khuyên đổi sang POST cho chuẩn, nhưng giữ GET nếu m đang dùng ở FE.
    @GetMapping("logout")
    public ApiResource<Void> logout(@RequestHeader("Authorization") String bearerToken) {
        String token = bearerToken.substring(7);
        BlacklistTokenRequest request = new BlacklistTokenRequest();
        request.setToken(token); blacklistedService.create(request);
        return ApiResource.ok(null, "Đăng xuất thành công");
    }

    @PostMapping("refresh")
    public ApiResource<LoginResource> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtService.isRefreshTokenValid(refreshToken)) {
            throw new BusinessException("BAD_REQUEST", "RefreshToken không hợp lệ", HttpStatus.BAD_REQUEST);
        }

        Optional<RefreshToken> dbRefreshToken = refreshTokenRepository.findByRefreshToken(refreshToken);
        if (dbRefreshToken.isEmpty()) {
            throw new BusinessException("NOT_FOUND", "RefreshToken không tồn tại", HttpStatus.NOT_FOUND);
        }

        Long userId = dbRefreshToken.get().getUserId();
        String email = dbRefreshToken.get().getUser().getEmail();

        String newToken = jwtService.generateToken(userId, email, null);
        String newRefreshToken = jwtService.generateRefreshToken(userId, email);

        return ApiResource.ok(
                new LoginResource(newToken, newRefreshToken, new AuthResource(userId)),
                "Làm mới token thành công"
        );
    }
}
