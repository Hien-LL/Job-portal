package com.jobportal.services.impl;

import com.jobportal.commons.BaseService;
import com.jobportal.dtos.requests.NotificationRequest;
import com.jobportal.entities.Notification;
import com.jobportal.entities.User;
import com.jobportal.mappers.NotificationMapper;
import com.jobportal.repositories.NotificationRepository;
import com.jobportal.repositories.UserRepository;
import com.jobportal.services.interfaces.NotificationServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

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
        return null;
    }


}
