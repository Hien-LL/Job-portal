package com.jobportal.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class PermissionCreationRequest {
    private Long id;
    @NotBlank(message = "Tên không đươợc để trống")
    private String name;
    @NotBlank(message = "Mổ tả không được để trống")
    private String description;
}
