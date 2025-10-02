package com.jobportal.services.interfaces;

import com.jobportal.dtos.requests.LoginRequest;
import com.jobportal.dtos.requests.RegisterRequest;
import com.jobportal.dtos.resources.UserDetailsResource;
import jakarta.validation.Valid;

import java.util.Set;

public interface AuthServiceInterface {
    Object authenticate(LoginRequest request);
    UserDetailsResource getUserFromEmail(String email);
    Object createUser(RegisterRequest request);
    UserDetailsResource updateRolesForUser(@Valid Set<Long> roleIds, Long id);
}
