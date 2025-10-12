package com.jobportal.controllers;

import com.jobportal.dtos.requests.JobCreationRequest;
import com.jobportal.dtos.requests.JobUpdationRequest;
import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.JobResource;
import com.jobportal.dtos.resources.UserProfileResource;
import com.jobportal.entities.Job;
import com.jobportal.mappers.JobMapper;
import com.jobportal.services.impl.JobService;
import com.jobportal.services.interfaces.AuthServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("api/jobs")
public class JobController {
    private final JobService jobService;
    private final AuthServiceInterface authService;
    private final JobMapper jobMapper;

    @PostMapping("/my-company/{companyId}")
    public ResponseEntity<?> createJob(@Valid @RequestBody JobCreationRequest request, @PathVariable Long companyId) {
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

    @GetMapping("/{jobId}")
    public ResponseEntity<?> getJobDetail(@PathVariable Long jobId) {
        try {
            JobResource jobResource = jobService.getJobDetailById(jobId);
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
        Page<JobResource>  jobResources = jobMapper.tResourcePage(jobs);
        ApiResource<Page<JobResource>> resource = ApiResource.ok(jobResources, "Success");
        return ResponseEntity.ok(resource);
    }

    @PutMapping("/my-company/{companyId}/job/{jobId}")
    public ResponseEntity<?> updateJob(@PathVariable Long companyId, @PathVariable Long jobId,
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
}
