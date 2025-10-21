package com.jobportal.controllers;

import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.services.impl.FollowCompanyService;
import com.jobportal.services.interfaces.AuthServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follow-company")
@RequiredArgsConstructor
public class FollowCompanyController {
    private final FollowCompanyService followCompanyService;
    private final AuthServiceInterface authService;

    @PostMapping("{companyId}/follow")
    public ResponseEntity<?> followCompany(@PathVariable Long companyId) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId = authService.getUserFromEmail(email).getId();
            followCompanyService.followCompany(userId, companyId);
            return ResponseEntity.ok(ApiResource.ok(null, "theo dõi công ty thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResource.error("BAD_REQUEST", e.getMessage(), HttpStatus.BAD_REQUEST));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @DeleteMapping("{companyId}/unfollow")
    public ResponseEntity<?> unfollowCompany(@PathVariable Long companyId) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId = authService.getUserFromEmail(email).getId();
            followCompanyService.unfollowCompany(userId, companyId);
            return ResponseEntity.ok(ApiResource.ok(null, "bỏ theo dõi công ty thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResource.error("BAD_REQUEST", e.getMessage(), HttpStatus.BAD_REQUEST));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
