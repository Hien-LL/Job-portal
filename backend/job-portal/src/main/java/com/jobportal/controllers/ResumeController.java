package com.jobportal.controllers;

import com.jobportal.dtos.requests.ResumeReq;
import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.ResumeResource;
import com.jobportal.dtos.resources.UserProfileResource;
import com.jobportal.services.interfaces.AuthServiceInterface;
import com.jobportal.services.interfaces.ResumeServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeServiceInterface resumeService;
    private final AuthServiceInterface authService;

    @GetMapping("/me")
    public ResponseEntity<?> getList() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            UserProfileResource user = authService.getUserFromEmail(email);

            List<ResumeResource> resumes = resumeService.getListById(user.getId());
            return ResponseEntity.ok(ApiResource.ok(resumes, "Success"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @GetMapping("/me/{resumeId}")
    public ResponseEntity<?> getDetail(@PathVariable Long resumeId) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            UserProfileResource user = authService.getUserFromEmail(email);

            ResumeResource resume = resumeService.getDetail(user.getId(), resumeId);
            return ResponseEntity.ok(ApiResource.ok(resume, "Success"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @PostMapping("/me")
    public ResponseEntity<?> create(@RequestBody @Valid ResumeReq req) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            UserProfileResource user = authService.getUserFromEmail(email);

            ResumeResource result = resumeService.create(user.getId(), req);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResource.ok(result, "Created"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @PutMapping("/me/{resumeId}")
    public ResponseEntity<?> update(@PathVariable Long resumeId, @RequestBody @Valid ResumeReq req) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            UserProfileResource user = authService.getUserFromEmail(email);
            ResumeResource result = resumeService.update(user.getId(), resumeId, req);
            return ResponseEntity.ok(ApiResource.ok(result, "Updated"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
        }
}
