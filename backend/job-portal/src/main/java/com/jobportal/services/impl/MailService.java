package com.jobportal.services.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {
    private final JavaMailSender mailSender;

    public void sendOtp(String to, String code) {
        var msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject("Your Verification Code");
        msg.setText("Here is your OTP: " + code + " (valid 5 minutes)");
        mailSender.send(msg);
    }
}
