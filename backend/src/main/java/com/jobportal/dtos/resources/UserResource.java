package com.jobportal.dtos.resources;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResource {
    private Long id;
    private String email;
    private String name;
    private String phone;
    private String address;
    private String headline;
    private String description;
    private Set<RoleResource> roles;
}
