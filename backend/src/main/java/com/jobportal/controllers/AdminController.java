package com.jobportal.controllers;

import com.jobportal.dtos.requests.NotificationRequest;
import com.jobportal.dtos.requests.creation.NotificationCreationForUserRequest;
import com.jobportal.dtos.requests.updation.RolesForUserUpdationRequest;
import com.jobportal.dtos.resources.*;
import com.jobportal.entities.Job;
import com.jobportal.entities.User;
import com.jobportal.mappers.JobMapper;
import com.jobportal.mappers.UserMapper;
import com.jobportal.services.impl.CompanyAdminService;
import com.jobportal.services.interfaces.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admins")
public class AdminController {
    private final JobServiceInterface jobService;
    private final NotificationServiceInterface notificationService;
    private final JobMapper jobMapper;
    private final AdminServiceInterface adminService;
    private final CompanyServiceInterface companyService;
    private final CompanyAdminService companyAdminService;
    private final UserServiceInterface userService;
    private final UserMapper userMapper;
    private final AuthServiceInterface authService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/jobs")
    public ApiResource<Page<JobListItemResource>> getAllJobsForAdmin(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        Page<Job> jobs = jobService.paginationJob(params, true);
        Page<JobListItemResource> jobResources = jobMapper.tListResourcePage(jobs);
        return ApiResource.ok(jobResources, "Success");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats")
    public ApiResource<AdminStatsResource> getAdminStats() {
        AdminStatsResource adminStatsResource = adminService.getStats();
        return ApiResource.ok(adminStatsResource, "Success");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/companies/{companyId}/verify")
    public ApiResource<?> verifyCompany(@PathVariable("companyId") Long companyId) {
        boolean result = companyService.verifyCompany(companyId);
        return ApiResource.ok(result, "Company verified successfully");

    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/companies/{companyId}")
    public ApiResource<?> deleteCompany(@PathVariable("companyId") Long companyId) {
        companyAdminService.deleteCompany(companyId);
        return ApiResource.ok(null, "Company deleted successfully");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/jobs/{jobId}/publish")
    public ApiResource<?> publishJob(@PathVariable("jobId") Long jobId) {
        boolean result = jobService.publishJob(jobId);
        return ApiResource.ok(result, "Job published successfully");
    }

    @DeleteMapping("/jobs/{jobId}" )
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResource<?> deleteJob(@PathVariable("jobId") Long jobId) {
        adminService.deleteJob(jobId);
        return ApiResource.ok(null, "Job deleted successfully");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ApiResource<Page<UserResource>> index(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        Page<User> users = userService.paginate(params);
        return ApiResource.ok(userMapper.tResourcePage(users), "SUCCESS");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/users/{id}")
    public ApiResource<UserDetailsResource> updateRolesForUser(
            @Valid @RequestBody RolesForUserUpdationRequest request,
            @PathVariable @Positive(message = "id phải lớn hơn 0") Long id
    ) {
        UserDetailsResource resource = authService.updateRolesForUser(request.getRoleIds(), id);
        return ApiResource.ok(resource, "Cập nhật bản ghi thành công");
    }

    @PreAuthorize("hasPermission(null , 'DELETE_USER')")
    @DeleteMapping("/users/{id}")
    public ApiResource<Void> delete(@PathVariable @Positive(message = "id phải lớn hơn 0") Long id) {
        userService.delete(id);
        return ApiResource.ok(null, "Xóa bản ghi thành công");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/notifications")
    public ApiResource<Page<NotificationListItemResource>> getAllNotificationsForAdmin(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        Page<NotificationListItemResource> notifications = notificationService.getNotificationsForAdmin(params);
        return ApiResource.ok(notifications, "Success");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/notifications/{userId}")
    public ApiResource<Void> createNotificationForUser(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody NotificationRequest request) {

        notificationService.sendNotification(userId, request);
        return ApiResource.ok(null, "Notification created for user successfully");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/notifications/all")
    public ApiResource<Void> createNotificationForAllUsers(
            @Valid @RequestBody NotificationRequest request) {

        notificationService.sendNotificationToAllUsers(request);
        return ApiResource.ok(null, "Notification created for all users successfully");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/notifications/recruiters")
    public ApiResource<Void> createNotificationForAllRecruiters(
            @Valid @RequestBody NotificationRequest request) {

        notificationService.sendNotificationToAllRecruiters(request);
        return ApiResource.ok(null, "Notification created for all recruiters successfully");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/notifications/candidates")
    public ApiResource<Void> createNotificationForAllCandidates(
            @Valid @RequestBody NotificationRequest request) {

        notificationService.sendNotificationToAllCandidates(request);
        return ApiResource.ok(null, "Notification created for all candidates successfully");
    }

}
