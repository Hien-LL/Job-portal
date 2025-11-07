package com.jobportal.controllers;

import com.jobportal.dtos.requests.NotificationRequest;
import com.jobportal.dtos.requests.creation.JobCreationRequest;
import com.jobportal.dtos.requests.updation.JobUpdationRequest;
import com.jobportal.dtos.resources.*;
import com.jobportal.entities.Job;
import com.jobportal.mappers.JobMapper;
import com.jobportal.securities.helps.details.CustomUserDetails;
import com.jobportal.services.interfaces.AuthServiceInterface;
import com.jobportal.services.interfaces.JobServiceInterface;
import com.jobportal.services.interfaces.NotificationServiceInterface;
import com.jobportal.services.interfaces.SavedJobServiceInterface;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("api/jobs")
public class JobController {

    private final JobServiceInterface jobService;
    private final SavedJobServiceInterface savedJobService;
    private final JobMapper jobMapper;
    private final NotificationServiceInterface notificationService;
    private final AuthServiceInterface authService;
    private final Logger logger = org.slf4j.LoggerFactory.getLogger(JobController.class);

    @PostMapping("/my-company/create")
    public ApiResource<JobResource> createJob(
            @Valid @RequestBody JobCreationRequest request
    ) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Long userId = authService.getUserFromEmail(email).getId();
        logger.info("Creating job for user with ID: {}", userId);
        JobResource jobResource = jobService.createJobForMyCompany(userId, request);
        return ApiResource.ok(jobResource, "Create job");
    }

    @GetMapping("/{slug}")
    public ApiResource<JobResource> getJobDetail(@PathVariable String slug) {
        JobResource jobResource = jobService.getJobDetailBySlug(slug);
        return ApiResource.ok(jobResource, "Success");
    }

    @GetMapping
    public ApiResource<Page<JobListItemResource>> getAllJobs(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        Page<Job> jobs = jobService.paginationJob(params, false);
        Page<JobListItemResource> jobResources = jobMapper.tListResourcePage(jobs);
        return ApiResource.ok(jobResources, "Success");
    }

    @GetMapping("my-company/jobs")
    public ApiResource<Page<JobListItemResource>> getJobsForMyCompany(
            @AuthenticationPrincipal CustomUserDetails user,
            HttpServletRequest request
    ) {
        Long userId = user.getUserId();
        Map<String, String[]> params = request.getParameterMap();
        Page<Job> jobs =  jobService.paginationJobForMyCompany(userId, params);
        Page<JobListItemResource> jobResources = jobMapper.tListResourcePage(jobs);
        return ApiResource.ok(jobResources, "Get jobs for my company");
    }

    @GetMapping("/my-company/job/{jobId}")
    public ApiResource<JobResource> getJobForMyCompany(
            @AuthenticationPrincipal CustomUserDetails user,
            @Positive(message = "id phải lớn hơn 0") @PathVariable Long jobId
    ) {
        Long userId = user.getUserId();
        JobResource jobResource = jobService.getJobForMyCompany(userId, jobId);
        return ApiResource.ok(jobResource, "Get job");
    }

    @PutMapping("/my-company/job/{jobId}")
    public ApiResource<JobResource> updateJob(
            @AuthenticationPrincipal CustomUserDetails user,
            @Positive(message = "id phải lớn hơn 0") @PathVariable Long jobId,
            @Valid @RequestBody JobUpdationRequest request
    ) {
        Long userId = user.getUserId();
        JobResource jobResource = jobService.updateJobForMyCompany(userId, jobId, request);
        return ApiResource.ok(jobResource, "Update job");
    }

    @DeleteMapping("/my-company/job/{jobId}")
    public ApiResource<Void> deleteJob(
            @AuthenticationPrincipal CustomUserDetails user,
            @Positive(message = "id phải lớn hơn 0") @PathVariable Long jobId
    ) {
        Long userId = user.getUserId();
        jobService.deleteJobForMyCompany(userId, jobId);
        return ApiResource.ok(null, "Xóa thành công job");
    }
}
