package com.jobportal.services.impl;

import com.jobportal.commons.BaseService;
import com.jobportal.dtos.requests.NotificationRequest;
import com.jobportal.dtos.resources.NotificationListItemResource;
import com.jobportal.dtos.resources.UserListItemForNotiResource;
import com.jobportal.dtos.resources.UserResource;
import com.jobportal.entities.Notification;
import com.jobportal.entities.User;
import com.jobportal.mappers.NotificationMapper;
import com.jobportal.repositories.NotificationRepository;
import com.jobportal.repositories.UserRepository;
import com.jobportal.repositories.views.NotificationAdminProjection;
import com.jobportal.services.interfaces.NotificationServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService extends BaseService implements NotificationServiceInterface {
    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final UserRepository userRepository;

    @Override
    public void sendNotification(Long userId, NotificationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

        Notification notification = notificationMapper.tEntity(request);
        notification.setUser(user);
        notificationRepository.save(notification);
    }

    @Override
    public List<Notification> findByUserId(Long userId) {
        Sort sort = Sort.by(Sort.Order.desc("createdAt"));
        return notificationRepository.findAll(hasUser(userId), sort);
    }

    @Override
    public Notification findById(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông báo"));
        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Thông báo không thuộc về người dùng");
        }
        return notification;
    }

    @Override
    public void markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông báo"));
        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Thông báo không thuộc về người dùng");
        }
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findAll(hasUser(userId));
        LocalDateTime now = LocalDateTime.now();
        for (Notification notification : notifications) {
            notification.setReadAt(now);
        }
        notificationRepository.saveAll(notifications);
    }

    @Override
    public Page<NotificationListItemResource> getNotificationsForAdmin(Map<String, String[]> params) {

        int page = params.containsKey("page") ? Integer.parseInt(params.get("page")[0]) - 1 : 0;
        int size = params.containsKey("perPage") ? Integer.parseInt(params.get("perPage")[0]) : 10;

        Pageable pageable = PageRequest.of(page, size);

        Page<NotificationAdminProjection> result = notificationRepository.findAllForAdmin(pageable);

        return result.map(this::mapToResource);
    }

    private NotificationListItemResource mapToResource(NotificationAdminProjection p) {
        return NotificationListItemResourceBuilder(p);
    }

    private NotificationListItemResource NotificationListItemResourceBuilder(
            NotificationAdminProjection p) {

        UserListItemForNotiResource user = UserListItemForNotiResource.builder()
                .id(p.getUserId())
                .email(p.getUserEmail())
                .name(p.getUserName())
                .build();

        return NotificationListItemResource.builder()
                .id(p.getId())
                .title(p.getTitle())
                .body(p.getBody())
                .createdAt(p.getCreatedAt())
                .readAt(p.getReadAt())
                .user(user)
                .build();
    }


}
