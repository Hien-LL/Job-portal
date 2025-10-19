package com.jobportal.services.interfaces;

import com.jobportal.dtos.requests.NotificationRequest;
import com.jobportal.entities.Notification;

import java.util.List;

public interface NotificationServiceInterface {
    void sendNotification(Long userId, NotificationRequest request);
    List<Notification> findByUserId(Long userId);
    Notification findById(Long userId, Long notificationId);
}
