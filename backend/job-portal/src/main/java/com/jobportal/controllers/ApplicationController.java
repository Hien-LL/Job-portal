package com.jobportal.controllers;

import com.jobportal.dtos.requests.creation.ApplicationCreationRequest;
import com.jobportal.dtos.requests.creation.ApplicationUpdateStatusRequest;
import com.jobportal.dtos.resources.*;
import com.jobportal.securities.helps.details.CustomUserDetails;
import com.jobportal.services.interfaces.ApplicationServiceInterface;
import com.jobportal.services.interfaces.ApplicationWorkflowServiceInterface;
import com.jobportal.services.interfaces.AuthServiceInterface;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationServiceInterface applicationService;
    private final ApplicationWorkflowServiceInterface applicationWorkflowService;

    @PostMapping("{jobId}/apply")
    public ApiResource<ApplicationResource> applyToJob(
            @AuthenticationPrincipal CustomUserDetails user,
            @Positive @PathVariable Long jobId,
            @Valid @RequestBody ApplicationCreationRequest request
    ) {
        Long userId = user.getUserId();
        ApplicationResource applicationResource = applicationService.createForJob(jobId, userId, request);
        return ApiResource.ok(applicationResource, "Apply thành công");
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("my-applications")
    public ApiResource<Page<ApplicationResource>> getMyApplications(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10, sort = "appliedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Long userId = user.getUserId();
        Page<ApplicationResource> applications = applicationService.getApplicationsByUserId(userId, status, pageable);
        return ApiResource.ok(applications, "Lấy danh sách ứng tuyển thành công");
    }

    @GetMapping("/my-companies/{companyId}/jobs/{jobId}")
    public ApiResource<Page<ApplicationListItemForCompanyResource>> getApplicationsForMyCompanyJob(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long companyId,
            @PathVariable Long jobId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10, sort = "appliedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Long actorUserId = user.getUserId();
        Page<ApplicationListItemForCompanyResource> data =
                applicationService.getApplicationsForMyCompanyJob(actorUserId, companyId, jobId, status, pageable);
        return ApiResource.ok(data, "Lấy danh sách ứng tuyển thành công");
    }

    @GetMapping("/{applicationId}")
    public ApiResource<ApplicationDetailResource> getDetail(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long applicationId
    ) {
        Long actorUserId = user.getUserId();
        ApplicationDetailResource data = applicationService.getDetailForActor(applicationId, actorUserId);
        return ApiResource.ok(data, "Lấy chi tiết ứng tuyển thành công");
    }

    @PutMapping("{applicationId}/change-status")
    public ApiResource<ApplicationStatusChangeResource> changeStatus(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long applicationId,
            @Valid @RequestBody ApplicationUpdateStatusRequest request
    ) {
        Long actorUserId = user.getUserId();
        ApplicationStatusChangeResource data =
                applicationWorkflowService.changeStatusOfApplication(actorUserId, applicationId, request);
        return ApiResource.ok(data, "Thay đổi trạng thái ứng tuyển thành công");
    }

    @GetMapping("{applicationId}/timeline")
    public ApiResource<?> getTimeline(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long applicationId
    ) {
        Long userId = user.getUserId();
        var data = applicationWorkflowService.timelineByApplication(userId, applicationId);
        return ApiResource.ok(data, "Lấy timeline ứng tuyển thành công");
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("isApplied/{jobId}")
    public ApiResource<Boolean> checkIfApplied(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long jobId
    ) {
        Long userId = user.getUserId();
        boolean isApplied = applicationService.existsByJobIdAndUserId(jobId, userId);
        return ApiResource.ok(isApplied, "Kiểm tra ứng tuyển thành công");
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/candidate-info/{applicationId}")
    public ApiResource<CandidateResource> getCandidateInfo(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long applicationId
    ) {
        Long actorUserId = user.getUserId();
        CandidateResource data = applicationService.getCandidateInfomations(applicationId, actorUserId);
        return ApiResource.ok(data, "Lấy thông tin ứng viên thành công");
    }
}
