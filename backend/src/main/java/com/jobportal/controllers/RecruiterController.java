package com.jobportal.controllers;

import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.ApplicationStatisticsResource;
import com.jobportal.dtos.resources.RecruiterOverviewResource;
import com.jobportal.securities.helps.details.CustomUserDetails;
import com.jobportal.services.interfaces.RecruiterServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recruiters")
@RequiredArgsConstructor
public class RecruiterController {

    private final RecruiterServiceInterface recruiterService;

    @GetMapping("dashboard/overview")
    public ApiResource getOverview(@AuthenticationPrincipal CustomUserDetails user) {
        Long userId = user.getUserId();
        RecruiterOverviewResource data = recruiterService.getOverview(userId);
        return ApiResource.ok(data, "Lấy tổng quan recruiter thành công");
    }

    @GetMapping("/jobs/recent")
    public ApiResource getRecentJobs(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(defaultValue = "5") int limit
    ) {
        Long userId = user.getUserId();
        var data = recruiterService.getRecentJobs(userId, limit);
        return ApiResource.ok(data, "Lấy jobs mới nhất thành công");
    }

    @GetMapping("/applications/recent")
    public ApiResource getRecentApplications(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(defaultValue = "pending") String status
    ) {
        Long userId = user.getUserId();
        var data = recruiterService.getRecentApplications(userId, limit, status);
        return ApiResource.ok(data, "Recent applications retrieved");
    }

    @GetMapping("/applications/statistics")
    public ApiResource getApplicationStatistics(@AuthenticationPrincipal CustomUserDetails user) {
        Long userId = user.getUserId();
        ApplicationStatisticsResource data = recruiterService.getApplicationStatistics(userId);
        return ApiResource.ok(data, "Application statistics retrieved");
    }
}

