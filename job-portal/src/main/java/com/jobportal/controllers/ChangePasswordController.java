package com.jobportal.controllers;

import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.services.impl.PasswordService;
import com.jobportal.services.interfaces.PasswordServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/password")
public class ChangePasswordController {
    private  final PasswordServiceInterface passwordService;

    @PostMapping("/otp/send")
    public ResponseEntity<?> send(@RequestBody Map<String,String> body) {
        passwordService.sendOtp(body.get("email"));
        return ResponseEntity.ok(ApiResource.ok(null, "OTP sent (if email exists)"));
    }

    @PostMapping("/change")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> change(@AuthenticationPrincipal UserDetails principal,
                                    @RequestBody Map<String,String> body) {
        passwordService.changeWhileLoggedIn(
                principal.getUsername(),
                body.get("otp"),
                body.get("currentPassword"),
                body.get("newPassword")
        );
        return ResponseEntity.ok(ApiResource.ok(null, "Password changed"));
    }

    @PostMapping("/reset")
    public ResponseEntity<?> reset(@RequestBody Map<String,String> body) {
        passwordService.resetByEmail(
                body.get("email"), body.get("otp"), body.get("newPassword")
        );
        return ResponseEntity.ok(ApiResource.ok(null, "Password reset"));
    }

}
