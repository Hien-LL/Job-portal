package com.jobportal.dtos.resources;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class NotificationListItemResource {
    private Long id;
    private String title;
    private String body;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private UserListItemForNotiResource user;
}
