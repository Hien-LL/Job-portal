package com.jobportal.controllers;

import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.NotificationResource;
import com.jobportal.dtos.resources.UserProfileResource;
import com.jobportal.entities.Notification;
import com.jobportal.mappers.NotificationMapper;
import com.jobportal.services.interfaces.AuthServiceInterface;
import com.jobportal.services.interfaces.NotificationServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationServiceInterface notificationService;
    private final AuthServiceInterface authService;
    private final NotificationMapper notificationMapper;

    @PreAuthorize("isAuthenticated()")
    @RequestMapping
    public ResponseEntity<?> getAllNotifications() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId =  authService.getUserFromEmail(email).getId();
            List<Notification> notifications = notificationService.findByUserId(userId);
            List<NotificationResource> notificationResources = notificationMapper.tResourceList(notifications);
            ApiResource<List<NotificationResource>> response = ApiResource.ok(notificationResources, "Lấy danh sách thông báo thành công");
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResource.error("NOT_FOUND", exception.getMessage(), HttpStatus.NOT_FOUND)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR
                    ));
        }
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("{id}/read" )
    public ResponseEntity<?> markNotificationAsRead(@Positive(message = "id phải lớn hơn 0") @PathVariable Long id) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId =  authService.getUserFromEmail(email).getId();
            notificationService.markAsRead(userId, id);
            ApiResource<Void> response = ApiResource.ok(null, "Đánh dấu thông báo đã đọc thành công");
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResource.error("NOT_FOUND", exception.getMessage(), HttpStatus.NOT_FOUND)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR
                    ));
        }
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("mark-all-read" )
    public ResponseEntity<?> markAllNotificationsAsRead() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId = authService.getUserFromEmail(email).getId();
            notificationService.markAllAsRead(userId);
            ApiResource<Void> response = ApiResource.ok(null, "Đánh dấu tất cả thông báo đã đọc thành công");
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResource.error("NOT_FOUND", exception.getMessage(), HttpStatus.NOT_FOUND)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR
                    ));
        }
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("{id}" )
    public ResponseEntity<?> getNotificationById(@PathVariable Long id) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId =  authService.getUserFromEmail(email).getId();
            Notification notification = notificationService.findById(userId, id);
            NotificationResource notificationResource = notificationMapper.tResource(notification);
            ApiResource<NotificationResource> response = ApiResource.ok(notificationResource, "Lấy thông báo thành công");
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResource.error("NOT_FOUND", exception.getMessage(), HttpStatus.NOT_FOUND)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR
                    ));
        }
    }
}
