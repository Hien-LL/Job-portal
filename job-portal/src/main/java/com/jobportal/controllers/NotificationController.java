package com.jobportal.controllers;

import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.NotificationResource;
import com.jobportal.entities.Notification;
import com.jobportal.mappers.NotificationMapper;
import com.jobportal.securities.helps.details.CustomUserDetails;
import com.jobportal.services.interfaces.NotificationServiceInterface;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationServiceInterface notificationService;
    private final NotificationMapper notificationMapper;

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ApiResource<List<NotificationResource>> getAllNotifications(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        Long userId = user.getUserId();
        List<Notification> notifications = notificationService.findByUserId(userId);
        return ApiResource.ok(notificationMapper.tResourceList(notifications),
                "Lấy danh sách thông báo thành công");
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("{id}/read")
    public ApiResource<Void> markNotificationAsRead(
            @AuthenticationPrincipal CustomUserDetails user,
            @Positive(message = "id phải lớn hơn 0") @PathVariable Long id
    ) {
        Long userId = user.getUserId();
        notificationService.markAsRead(userId, id);
        return ApiResource.ok(null, "Đánh dấu thông báo đã đọc thành công");
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("mark-all-read")
    public ApiResource<Void> markAllNotificationsAsRead(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        Long userId = user.getUserId();
        notificationService.markAllAsRead(userId);
        return ApiResource.ok(null, "Đánh dấu tất cả thông báo đã đọc thành công");
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("{id}")
    public ApiResource<NotificationResource> getNotificationById(
            @AuthenticationPrincipal CustomUserDetails user,
            @Positive(message = "id phải lớn hơn 0") @PathVariable Long id
    ) {
        Long userId = user.getUserId();
        Notification notification = notificationService.findById(userId, id);
        return ApiResource.ok(notificationMapper.tResource(notification),
                "Lấy thông báo thành công");
    }
}
