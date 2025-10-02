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
public class UserDetailsResource {
    private Long id;
    private String email;
    private String name;
    private String phone;
    private String address;
    private Set<RoleResource> roles;
}
