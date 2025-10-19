package com.jobportal.dtos.resources;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class NotificationResource {
    private Long id;
    private String title;
    private String body;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}
