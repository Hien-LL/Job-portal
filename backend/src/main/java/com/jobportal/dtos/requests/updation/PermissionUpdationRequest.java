package com.jobportal.dtos.requests.updation;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PermissionUpdationRequest {
    private String name;
    @Size(max = 100)
    private String description;
}
