package com.jobportal.services.interfaces;

import com.jobportal.dtos.requests.LoginRequest;
import com.jobportal.dtos.requests.RegisterRequest;
import com.jobportal.dtos.resources.UserDetailsResource;
import com.jobportal.dtos.resources.UserProfileResource;
import jakarta.validation.Valid;

import java.util.Set;

public interface AuthServiceInterface {
    Object authenticate(LoginRequest request);
    UserProfileResource getUserFromEmail(String email);
    UserProfileResource getProfileById(Long id);
    Object createUser(RegisterRequest request);
    UserDetailsResource updateRolesForUser(@Valid Set<Long> roleIds, Long id);
    void verifyEmail(String email, String otp);
    void resendOtp(String email);
}
