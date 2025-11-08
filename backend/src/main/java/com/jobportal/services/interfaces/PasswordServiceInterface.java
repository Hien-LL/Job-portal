package com.jobportal.services.interfaces;

public interface PasswordServiceInterface {
    void sendOtp(String email);                                  // gửi OTP (không leak email tồn tại)
    void sendPasswordResetEmail(String email);                   // gửi email đặt lại mật khẩu với OTP
    void changeWhileLoggedIn(String principalEmail, String otp,
                             String currentPassword, String newPassword); // đổi khi đang đăng nhập
    void resetByEmail(String email, String otp, String newPassword);     // quên mật khẩu
}
