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
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/my-company/{companyId}")
    public ApiResource<JobResource> createJob(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody JobCreationRequest request,
            @Positive(message = "id phải lớn hơn 0") @PathVariable Long companyId
    ) {
        Long userId = user.getUserId();
        JobResource jobResource = jobService.createJobForMyCompany(userId, companyId, request);

        notificationService.sendNotification(
                userId,
                NotificationRequest.builder()
                        .title("Tạo mới công việc")
                        .body("Công việc " + request.getTitle() + " đã được tạo thành công.")
                        .build()
        );

        return ApiResource.ok(jobResource, "Create job");
    }

    @GetMapping("list/{companyId}")
    public ApiResource<Page<JobListItemResource>> getJobsByCompanyId(
            @Positive(message = "id phải lớn hơn 0") @PathVariable Long companyId,
            HttpServletRequest request
    ) {
        Map<String, String[]> params = request.getParameterMap();
        Page<Job> jobs = jobService.getJobsByCompanyId(companyId, params);
        Page<JobListItemResource> jobResources = jobMapper.tListResourcePage(jobs);
        return ApiResource.ok(jobResources, "Success");
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

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/all")
    public ApiResource<Page<JobListItemResource>> getAllJobsForAdmin(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        Page<Job> jobs = jobService.paginationJob(params, true);
        Page<JobListItemResource> jobResources = jobMapper.tListResourcePage(jobs);
        return ApiResource.ok(jobResources, "Success");
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/my-company/{companyId}/job/{jobId}")
    public ApiResource<JobResource> getJobForMyCompany(
            @AuthenticationPrincipal CustomUserDetails user,
            @Positive(message = "id phải lớn hơn 0") @PathVariable Long companyId,
            @Positive(message = "id phải lớn hơn 0") @PathVariable Long jobId
    ) {
        Long userId = user.getUserId();
        JobResource jobResource = jobService.getJobForMyCompany(userId, companyId, jobId);
        return ApiResource.ok(jobResource, "Get job");
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/my-company/{companyId}/job/{jobId}")
    public ApiResource<JobResource> updateJob(
            @AuthenticationPrincipal CustomUserDetails user,
            @Positive(message = "id phải lớn hơn 0") @PathVariable Long companyId,
            @Positive(message = "id phải lớn hơn 0") @PathVariable Long jobId,
            @Valid @RequestBody JobUpdationRequest request
    ) {
        Long userId = user.getUserId();
        JobResource jobResource = jobService.updateJobForMyCompany(userId, companyId, jobId, request);
        return ApiResource.ok(jobResource, "Update job");
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/my-company/{companyId}/job/{jobId}")
    public ApiResource<Void> deleteJob(
            @AuthenticationPrincipal CustomUserDetails user,
            @Positive(message = "id phải lớn hơn 0") @PathVariable Long companyId,
            @Positive(message = "id phải lớn hơn 0") @PathVariable Long jobId
    ) {
        Long userId = user.getUserId();
        jobService.deleteJobForMyCompany(userId, companyId, jobId);
        return ApiResource.ok(null, "Xóa thành công job");
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{jobSlug}/save")
    public ApiResource<Void> saveJob(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable String jobSlug
    ) {
        Long userId = user.getUserId();
        savedJobService.saveJob(userId, jobSlug);
        return ApiResource.ok(null, "Lưu thành công job");
    }

    @PreAuthorize("isAuthenticated()")
    @RequestMapping(value = "saved-jobs/list", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResource<Page<SavedJobResource>> getSavedJobs(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long userId = user.getUserId();
        Page<SavedJobResource> resourcePage = savedJobService.getSavedJobsByUserId(userId, page, size);
        return ApiResource.ok(resourcePage, "Lấy danh sách công việc đã lưu thành công");
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{jobSlug}/unsave")
    public ApiResource<Void> unsaveJob(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable String jobSlug
    ) {
        Long userId = user.getUserId();
        savedJobService.removeSavedJob(userId, jobSlug);
        return ApiResource.ok(null, "Bỏ lưu thành công job");
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("{jobSlug}/is-saved")
    public ApiResource<Boolean> isJobSaved(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable String jobSlug
    ) {
        Long userId = user.getUserId();
        boolean isSaved = savedJobService.isJobSavedByUser(userId, jobSlug);
        return ApiResource.ok(isSaved, "Kiểm tra trạng thái lưu job thành công");
    }
}
