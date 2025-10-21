package com.jobportal.services.impl;

import com.jobportal.entities.User;
import com.jobportal.repositories.UserRepository;
import com.jobportal.services.interfaces.PasswordServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PasswordService implements PasswordServiceInterface {
    private final UserRepository userRepository;
    private final OtpService otpService;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;


    // ===== OTP =====
    @Override
    public void sendOtp(String rawEmail) {
        String email = norm(rawEmail);
        // Không leak tồn tại: luôn trả 200 ở controller
        userRepository.findByEmail(email).ifPresent(user -> {
            if (otpService.canResend(email)) {
                String code = otpService.generateAndStore(email);
                mailService.sendOtp(email, code);
            }
            // nếu không thể gửi (rate/daily limit) -> vẫn im lặng để tránh leak
        });
    }

    // ===== Đổi khi đang đăng nhập =====
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

        // (optional) revoke session
    }

    // ===== Helpers =====
    private void validateNewPassword(String newPassword, User user) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("Password phải >= 6 ký tự");
        }
        // tránh trùng mật khẩu cũ
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException("Password mới không được trùng password hiện tại");
        }
    }

    private String norm(String email) {
        if (email == null) throw new IllegalArgumentException("Email rỗng");
        return email.trim().toLowerCase();
    }
}
