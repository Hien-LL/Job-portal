package com.jobportal.repositories.views;

import java.time.LocalDateTime;

public interface NotificationAdminProjection {
    Long getId();
    String getTitle();
    String getBody();
    LocalDateTime getCreatedAt();
    LocalDateTime getReadAt();

    Long getUserId();
    String getUserEmail();
    String getUserName();
}
