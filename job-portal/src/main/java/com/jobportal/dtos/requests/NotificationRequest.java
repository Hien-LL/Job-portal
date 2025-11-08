package com.jobportal.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class NotificationRequest {
    @NotBlank(message = "title không được để trống")
    private String title;
    @NotBlank(message = "body không được để trống")
    private String body;
}
