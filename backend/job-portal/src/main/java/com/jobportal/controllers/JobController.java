package com.jobportal.controllers;

import com.jobportal.dtos.requests.JobCreationRequest;
import com.jobportal.dtos.requests.JobUpdationRequest;
import com.jobportal.dtos.resources.*;
import com.jobportal.entities.Job;
import com.jobportal.mappers.JobMapper;
import com.jobportal.services.impl.JobService;
import com.jobportal.services.interfaces.AuthServiceInterface;
import com.jobportal.services.interfaces.SavedJobServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("api/jobs")
public class JobController {
    private final JobService jobService;
    private final AuthServiceInterface authService;
    private final SavedJobServiceInterface savedJobService;
    private final JobMapper jobMapper;

    @PostMapping("/my-company/{companyId}")
    public ResponseEntity<?> createJob(@Valid @RequestBody JobCreationRequest request,@Positive(message = "id phải lơn hơn 0") @PathVariable Long companyId) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            UserProfileResource user = authService.getUserFromEmail(email);

            JobResource jobResource = jobService.createJobForMyCompany(user.getId(), companyId, request);
            return ResponseEntity.ok(ApiResource.ok(jobResource, "Create job"));
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

    @GetMapping("/{slug}")
    public ResponseEntity<?> getJobDetail(@PathVariable String slug) {
        try {
            JobResource jobResource = jobService.getJobDetailBySlug(slug);
            return ResponseEntity.ok(ApiResource.ok(jobResource, "Success"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @GetMapping()
    public ResponseEntity<?> getAllJobs(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        Page<Job> jobs = jobService.paginationJob(params);
        Page<JobListItemResource>  jobResources = jobMapper.tListResourcePage(jobs);
        ApiResource<Page<JobListItemResource>> resource = ApiResource.ok(jobResources, "Success");
        return ResponseEntity.ok(resource);
    }

    @PutMapping("/my-company/{companyId}/job/{jobId}")
    public ResponseEntity<?> updateJob(@Positive(message = "id phải lớn hơn 0") @PathVariable Long companyId,@Positive(message = "id phải lớn hơn 0") @PathVariable Long jobId,
                                        @RequestBody JobUpdationRequest request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            UserProfileResource user = authService.getUserFromEmail(email);

            JobResource jobResource = jobService.updateJobForMyCompany(user.getId(), companyId, jobId, request);
            return ResponseEntity.ok(ApiResource.ok(jobResource, "Update job"));
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

    @DeleteMapping("/my-company/{companyId}/job/{jobId})")
    public ResponseEntity<?> deleteJob(@Positive(message = "id phải lớn hơn 0") @PathVariable Long companyId,@Positive(message = "id phải lớn 0") @PathVariable Long jobId) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            UserProfileResource user = authService.getUserFromEmail(email);

            jobService.deleteJobForMyCompany(user.getId(), companyId, jobId);
            return ResponseEntity.ok(ApiResource.ok(null, "Xóa thành công job"));
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

    @PostMapping("/{jobSlug}/save")
    public ResponseEntity<?> saveJob(@PathVariable String jobSlug) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            UserProfileResource user = authService.getUserFromEmail(email);
            savedJobService.saveJob(user.getId(), jobSlug);
            return ResponseEntity.ok(ApiResource.ok(null, "Lưu thành công job"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResource.error("BAD_REQUEST", e.getMessage(), HttpStatus.BAD_REQUEST));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @PreAuthorize("isAuthenticated()")
    @RequestMapping("saved-jobs/list")
    public ResponseEntity<?> me(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            UserProfileResource userResource =  authService.getUserFromEmail(email);
             Page<SavedJobResource> resourcePage = savedJobService.getSavedJobsByUserId(userResource.getId(), page, size);

            ApiResource<Page<SavedJobResource>> response = ApiResource.ok(resourcePage, "Lấy danh sách công việc đã lưu thành công");

            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResource.error("NOT_FOUND", exception.getMessage(), HttpStatus.NOT_FOUND)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @DeleteMapping("/{jobSlug}/unsave")
    public ResponseEntity<?> unsaveJob(@PathVariable String jobSlug) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            UserProfileResource user = authService.getUserFromEmail(email);
            savedJobService.removeSavedJob(user.getId(), jobSlug);
            return ResponseEntity.ok(ApiResource.ok(null, "Bỏ lưu thành công job"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResource.error("BAD_REQUEST", e.getMessage(), HttpStatus.BAD_REQUEST));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
