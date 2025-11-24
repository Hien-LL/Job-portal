package com.jobportal.dtos.resources;

import lombok.Data;

import java.util.Set;

@Data
public class LoginResource {
    private final String token;
    private final String refreshToken;
    private final AuthResource user;
    private Set<RoleResource> roles;

    public LoginResource(String token,String refreshToken, AuthResource user, Set<RoleResource> roles) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.user = user;
        this.roles = roles;
    }
}
