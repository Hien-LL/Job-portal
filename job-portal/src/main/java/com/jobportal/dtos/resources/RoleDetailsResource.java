package com.jobportal.dtos.resources;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleDetailsResource {
    private Long id;
    private String name;
    private Integer priority;
    private Set<PermissionResource> permissions;
}
