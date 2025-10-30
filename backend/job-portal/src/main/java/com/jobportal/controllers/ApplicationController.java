package com.jobportal.controllers;

import com.jobportal.dtos.requests.creation.ApplicationCreationRequest;
import com.jobportal.dtos.requests.creation.ApplicationUpdateStatusRequest;
import com.jobportal.dtos.resources.*;
import com.jobportal.services.interfaces.ApplicationServiceInterface;
import com.jobportal.services.interfaces.ApplicationWorkflowServiceInterface;
import com.jobportal.services.interfaces.AuthServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/applications")
public class ApplicationController {
    private final ApplicationServiceInterface applicationService;
    private final AuthServiceInterface authService;
    private final ApplicationWorkflowServiceInterface applicationWorkflowService;

    @PreAuthorize("isAuthenticated()")
    @PostMapping("{jobId}/apply")
    public ResponseEntity<?> applyToJob(@Positive @PathVariable Long jobId,@Valid @RequestBody ApplicationCreationRequest request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId = authService.getUserFromEmail(email).getId();

            ApplicationResource applicationResource = applicationService.createForJob(jobId, userId, request);
            return ResponseEntity.ok(ApiResource.ok(applicationResource, "Apply thành công"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("my-applications")
    public ResponseEntity<?> getMyApplications(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10, sort = "appliedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId = authService.getUserFromEmail(email).getId();

            Page<ApplicationResource> applications = applicationService.getApplicationsByUserId(userId, status, pageable);
            return ResponseEntity.ok(ApiResource.ok(applications, "Lấy danh sách ứng tuyển thành công"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @GetMapping("/my-companies/{companyId}/jobs/{jobId}")
    public ResponseEntity<?> getApplicationsForMyCompanyJob(
            @PathVariable Long companyId,
            @PathVariable Long jobId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10, sort = "appliedAt", direction = Sort.Direction.DESC) Pageable pageable) {

        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Long actorUserId = authService.getUserFromEmail(email).getId();

            Page<ApplicationListItemForCompanyResource> data = applicationService
                    .getApplicationsForMyCompanyJob(actorUserId, companyId, jobId, status, pageable);

            return ResponseEntity.ok(ApiResource.ok(data, "Lấy danh sách ứng tuyển thành công"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResource.error("FORBIDDEN", e.getMessage(), HttpStatus.FORBIDDEN));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{applicationId}")
    public ResponseEntity<?> getDetail(@PathVariable Long applicationId) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Long actorUserId = authService.getUserFromEmail(email).getId();

            ApplicationDetailResource data = applicationService
                    .getDetailForActor(applicationId, actorUserId);

            return ResponseEntity.ok(ApiResource.ok(data, "Lấy chi tiết ứng tuyển thành công"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResource.error("FORBIDDEN", e.getMessage(), HttpStatus.FORBIDDEN));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @PutMapping("{applicationId}/change-status")
    public ResponseEntity<?> changeStatus(@PathVariable Long applicationId, @Valid @RequestBody ApplicationUpdateStatusRequest request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Long actorUserId = authService.getUserFromEmail(email).getId();

            ApplicationStatusChangeResource data = applicationWorkflowService
                    .changeStatusOfApplication(actorUserId, applicationId,  request);

            return ResponseEntity.ok(ApiResource.ok(data, "Thay đổi trạng thái ứng tuyển thành công"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResource.error("FORBIDDEN", e.getMessage(), HttpStatus.FORBIDDEN));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @GetMapping("{applicationId}/timeline")
    public ResponseEntity<?> getTimeline(@PathVariable Long applicationId) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId = authService.getUserFromEmail(email).getId();
            var data = applicationWorkflowService.timelineByApplication(userId, applicationId);
            return ResponseEntity.ok(ApiResource.ok(data, "Lấy timeline ứng tuyển thành công"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResource.error("FORBIDDEN", e.getMessage(), HttpStatus.FORBIDDEN));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @GetMapping("candidate-info/{applicationId}")
    public ResponseEntity<?> getCandidateInfo(@PathVariable Long applicationId) {
        try {
            var data = applicationService.getCandidateInfomations(applicationId);
            return ResponseEntity.ok(ApiResource.ok(data, "Lấy thông tin ứng viên thành công"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("isApplied/{jobId}")
    public ResponseEntity<?> checkIfApplied(@PathVariable Long jobId) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId = authService.getUserFromEmail(email).getId();
            boolean isApplied = applicationService.existsByJobIdAndUserId(jobId, userId);
            return ResponseEntity.ok(ApiResource.ok(isApplied, "Kiểm tra ứng tuyển thành công"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
