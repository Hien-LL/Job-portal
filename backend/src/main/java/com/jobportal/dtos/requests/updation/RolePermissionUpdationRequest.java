package com.jobportal.dtos.requests.updation;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Set;

@Data
public class RolePermissionUpdationRequest {
    @NotNull(message = "permissionIds phải là một mảng")
    @NotEmpty(message = "permissionIds không được rỗng")
    private Set<Long> permissionIds;
}
