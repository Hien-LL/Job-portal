package com.jobportal.services.impl;

import com.jobportal.entities.User;
import com.jobportal.repositories.UserRepository;
import com.jobportal.services.interfaces.PasswordServiceInterface;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordService implements PasswordServiceInterface {
    private final UserRepository userRepository;
    private final OtpService otpService;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;

    @Value("${app.frontend.url:http://127.0.0.1:5500}")
    private String frontendUrl;

    // ===== OTP - Gửi mã xác thực =====
    @Override
    public void sendOtp(String rawEmail) {
        String email = norm(rawEmail);
        // Không leak tồn tại: luôn trả 200 ở controller
        userRepository.findByEmail(email).ifPresent(user -> {
            if (otpService.canResend(email)) {
                String code = otpService.generateAndStore(email);
                mailService.sendOtp(email, code);
            }
            log.info("OTP sent to email: {}", email);
            // nếu không thể gửi (rate/daily limit) -> vẫn im lặng để tránh leak
        });
    }

    // ===== Đổi khi đang đăng nhập =====
    // ===== Đặt lại mật khẩu - Gửi email với OTP =====
    @Override
    public void sendPasswordResetEmail(String rawEmail) {
        String email = norm(rawEmail);
        userRepository.findByEmail(email).ifPresent(user -> {
            if (otpService.canResend(email)) {
                String otp = otpService.generateAndStore(email);
                // Tạo link reset password với OTP
                String resetLink = frontendUrl + "/reset-password?email=" + email + "&otp=" + otp;

                // Gửi email đặt lại mật khẩu tiếng Việt
                mailService.sendPasswordReset(email, resetLink, user.getName());
                log.info("Password reset email sent to: {}", email);
            }
        });
    }

    @Override
    @Transactional
    public void changeWhileLoggedIn(String principalEmail, String otp,
                                    String currentPassword, String newPassword) {
        String email = norm(principalEmail);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Email hoặc OTP không hợp lệ"));

        // 1) check current password
        if (currentPassword == null || !passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadCredentialsException("Mật khẩu hiện tại không đúng");
        }

        // 2) verify OTP (consume nếu đúng)
        if (!otpService.verify(email, otp)) {
            throw new BadCredentialsException("OTP không hợp lệ hoặc đã hết hạn");
        }

        // 3) policy + update
        validateNewPassword(newPassword, user);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password changed for user: {}", email);
        // 4) (optional) revoke session ở đây nếu m dùng tokenVersion/blacklist
    }

    // ===== Quên mật khẩu (không đăng nhập) =====
    @Override
    @Transactional
    public void resetByEmail(String rawEmail, String otp, String newPassword) {
        String email = norm(rawEmail);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Email hoặc OTP không hợp lệ"));

        if (!otpService.verify(email, otp)) {
            throw new BadCredentialsException("OTP không hợp lệ hoặc đã hết hạn");
        }

        validateNewPassword(newPassword, user);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password reset for user: {}", email);
        // (optional) revoke session
    }

    // ===== Helpers =====
    private void validateNewPassword(String newPassword, User user) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("Password phải >= 6 ký tự");
            // tránh trùng mật khẩu cũ
        }
    }
    private String norm(String email) {
        if (email == null) throw new IllegalArgumentException("Email rỗng");
        if (email == null) throw new IllegalArgumentException("Email không được để trống");
        return email.trim().toLowerCase();
    }
}