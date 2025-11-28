package com.jobportal.services.interfaces;

import com.jobportal.dtos.requests.NotificationRequest;
import com.jobportal.dtos.resources.NotificationListItemResource;
import com.jobportal.entities.Notification;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

public interface NotificationServiceInterface {
    void sendNotification(Long userId, NotificationRequest request);
    List<Notification> findByUserId(Long userId);
    Notification findById(Long userId, Long notificationId);
    void markAsRead(Long userId, Long notificationId);
    void markAllAsRead(Long userId);
    Page<NotificationListItemResource> getNotificationsForAdmin(Map<String, String[]> params);
    void sendNotificationToAllUsers(NotificationRequest request);
    void sendNotificationToAllRecruiters(NotificationRequest request);
    void sendNotificationToAllCandidates(NotificationRequest request);
}
