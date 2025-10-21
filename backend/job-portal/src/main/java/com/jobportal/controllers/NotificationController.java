package com.jobportal.controllers;

import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.NotificationResource;
import com.jobportal.dtos.resources.UserProfileResource;
import com.jobportal.entities.Notification;
import com.jobportal.mappers.NotificationMapper;
import com.jobportal.services.interfaces.AuthServiceInterface;
import com.jobportal.services.interfaces.NotificationServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
