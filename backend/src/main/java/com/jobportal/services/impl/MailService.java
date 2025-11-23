package com.jobportal.services.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.mail.from:JobPortal <no-reply@jobportal.works>}")
    private String mailFrom;

    public void sendOtp(String to, String code) {
        Map<String, Object> model = new HashMap<>();
        model.put("code", code);
        model.put("validTime", "5");

        sendHtmlEmail(to, "Your Verification Code", "otp", model);
    }

    public void sendPasswordReset(String to, String resetLink, String name) {
        Map<String, Object> model = new HashMap<>();
        model.put("name", name);
        model.put("resetLink", resetLink);
        model.put("validTime", "24");

        sendHtmlEmail(to, "Password Reset Request", "password-reset", model);
    }

    public void sendWelcome(String to, String name) {
        Map<String, Object> model = new HashMap<>();
        model.put("name", name);

        sendHtmlEmail(to, "Welcome to Job Portal", "welcome", model);
    }

    public void sendApplicationNotification(String to, String recipientName, String jobTitle, String companyName, String status) {
        Map<String, Object> model = new HashMap<>();
        model.put("recipientName", recipientName);
        model.put("jobTitle", jobTitle);
        model.put("companyName", companyName);
        model.put("status", status);

        sendHtmlEmail(to, "Application Status Update - " + jobTitle, "application-status", model);
    }

    private void sendHtmlEmail(String to, String subject, String templateName, Map<String, Object> model) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            // Process template
            Context context = new Context();
            context.setVariables(model);
            String htmlContent = templateEngine.process(templateName, context);

            helper.setFrom(mailFrom);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML content

            mailSender.send(mimeMessage);
            log.info("Email sent successfully to: {} with template: {}", to, templateName);
        } catch (MessagingException e) {
            log.error("Failed to send email to: {} - Error: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
