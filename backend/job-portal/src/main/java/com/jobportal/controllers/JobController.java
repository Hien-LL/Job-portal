package com.jobportal.controllers;

import com.jobportal.dtos.requests.creation.JobCreationRequest;
import com.jobportal.dtos.requests.updation.JobUpdationRequest;
import com.jobportal.dtos.requests.NotificationRequest;
import com.jobportal.dtos.resources.*;
import com.jobportal.entities.Job;
import com.jobportal.mappers.JobMapper;
import org.springframework.security.core.Authentication;
import com.jobportal.services.interfaces.AuthServiceInterface;
import com.jobportal.services.interfaces.JobServiceInterface;
import com.jobportal.services.interfaces.NotificationServiceInterface;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

import static org.springframework.security.authorization.AuthorityReactiveAuthorizationManager.hasAuthority;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("api/jobs")
public class JobController {
    private final JobServiceInterface jobService;
    private final AuthServiceInterface authService;
    private final SavedJobServiceInterface savedJobService;
    private final JobMapper jobMapper;
    private final NotificationServiceInterface notificationService;

    @PostMapping("/my-company/{companyId}")
    public ResponseEntity<?> createJob(@Valid @RequestBody JobCreationRequest request,@Positive(message = "id phải lơn hơn 0") @PathVariable Long companyId) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId = authService.getUserFromEmail(email).getId();
            NotificationRequest notificationRequest = NotificationRequest.builder()
                    .title("Tạo mới công việc")
                    .body("Công việc " + request.getTitle() + " đã được tạo thành công.")
                    .build();
            JobResource jobResource = jobService.createJobForMyCompany(userId, companyId, request);
            notificationService.sendNotification(userId, notificationRequest);
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

    @GetMapping("list/{companyId}")
    public ResponseEntity<?> getJobsByCompanyId(@Positive(message = "id phải lớn hơn 0") @PathVariable Long companyId, HttpServletRequest request) {
        try {
            Map<String, String[]> params = request.getParameterMap();
            Page<Job> jobs =  jobService.getJobsByCompanyId(companyId, params);
            Page<JobListItemResource> jobResources = jobMapper.tListResourcePage(jobs);
            ApiResource<Page<JobListItemResource>> resource = ApiResource.ok(jobResources, "Success");
            return ResponseEntity.ok(resource);
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

    @GetMapping
    public ResponseEntity<?> getAllJobs(HttpServletRequest request, Authentication auth) {
        Map<String, String[]> params = request.getParameterMap();

        Page<Job> jobs = jobService.paginationJob(params, false);
        Page<JobListItemResource> jobResources = jobMapper.tListResourcePage(jobs);
        return ResponseEntity.ok(ApiResource.ok(jobResources, "Success"));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllJobsForAdmin(HttpServletRequest request, Authentication auth) {
        Map<String, String[]> params = request.getParameterMap();

        Page<Job> jobs = jobService.paginationJob(params, true);
        Page<JobListItemResource> jobResources = jobMapper.tListResourcePage(jobs);
        return ResponseEntity.ok(ApiResource.ok(jobResources, "Success" + (auth == null ? "null" : auth.getAuthorities().toString())));
    }


    @GetMapping("/my-company/{companyId}/job/{jobId}")
    public ResponseEntity<?> getJobForMyCompany(@Positive(message = "id phải lớn hơn 0") @PathVariable Long companyId,@Positive(message = "id phải lớn hơn 0") @PathVariable Long jobId) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId = authService.getUserFromEmail(email).getId();

            JobResource jobResource = jobService.getJobForMyCompany(userId, companyId, jobId);
            return ResponseEntity.ok(ApiResource.ok(jobResource, "Get job"));
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

    @PutMapping("/my-company/{companyId}/job/{jobId}")
    public ResponseEntity<?> updateJob(@Positive(message = "id phải lớn hơn 0") @PathVariable Long companyId,@Positive(message = "id phải lớn hơn 0") @PathVariable Long jobId,
                                        @RequestBody JobUpdationRequest request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId = authService.getUserFromEmail(email).getId();

            JobResource jobResource = jobService.updateJobForMyCompany(userId, companyId, jobId, request);
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

    @DeleteMapping("/my-company/{companyId}/job/{jobId}")
    public ResponseEntity<?> deleteJob(@Positive(message = "id phải lớn hơn 0") @PathVariable Long companyId,@Positive(message = "id phải lớn 0") @PathVariable Long jobId) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId = authService.getUserFromEmail(email).getId();

            jobService.deleteJobForMyCompany(userId, companyId, jobId);
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
            Long userId = authService.getUserFromEmail(email).getId();
            savedJobService.saveJob(userId, jobSlug);
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
            Long userId = authService.getUserFromEmail(email).getId();
             Page<SavedJobResource> resourcePage = savedJobService.getSavedJobsByUserId(userId, page, size);

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
            Long userId = authService.getUserFromEmail(email).getId();
            savedJobService.removeSavedJob(userId, jobSlug);
            return ResponseEntity.ok(ApiResource.ok(null, "Bỏ lưu thành công job"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResource.error("BAD_REQUEST", e.getMessage(), HttpStatus.BAD_REQUEST));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @GetMapping("{jobSlug}/is-saved" )
    public ResponseEntity<?> isJobSaved(@PathVariable String jobSlug) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId = authService.getUserFromEmail(email).getId();
            boolean isSaved = savedJobService.isJobSavedByUser(userId, jobSlug);
            return ResponseEntity.ok(ApiResource.ok(isSaved, "Kiểm tra trạng thái lưu job thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResource.error("BAD_REQUEST", e.getMessage(), HttpStatus.BAD_REQUEST));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
