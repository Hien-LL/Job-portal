package com.jobportal.controllers;

import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.JobListItemResource;
import com.jobportal.entities.Job;
import com.jobportal.mappers.JobMapper;
import com.jobportal.services.interfaces.JobServiceInterface;
import com.jobportal.services.interfaces.NotificationServiceInterface;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admins")
public class AdminController {
    private final JobServiceInterface jobService;
    private final NotificationServiceInterface notificationService;
    private final JobMapper jobMapper;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/jobs")
    public ApiResource<Page<JobListItemResource>> getAllJobsForAdmin(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        Page<Job> jobs = jobService.paginationJob(params, true);
        Page<JobListItemResource> jobResources = jobMapper.tListResourcePage(jobs);
        return ApiResource.ok(jobResources, "Success");
    }
}
