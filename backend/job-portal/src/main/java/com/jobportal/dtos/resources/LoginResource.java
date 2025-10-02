package com.jobportal.dtos.resources;

public class LoginResource {
    private final String token;
    private final String refreshToken;
    private final AuthResource user;

    public LoginResource(String token,String refreshToken, AuthResource user) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.user = user;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public String getToken() {
        return token;
    }

    public AuthResource getUser() {
        return user;
    }
}
