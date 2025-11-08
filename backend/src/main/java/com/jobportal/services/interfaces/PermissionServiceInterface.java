package com.jobportal.services.interfaces;

import com.jobportal.dtos.requests.creation.PermissionCreationRequest;
import com.jobportal.dtos.requests.updation.PermissionUpdationRequest;
import com.jobportal.dtos.resources.PermissionResource;
import com.jobportal.entities.Permission;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

public interface PermissionServiceInterface {
    Permission create(PermissionCreationRequest request);
    Permission update(Long id, PermissionUpdationRequest request);
    Page<Permission> paginate(Map<String, String[]> parameters);
    void delete(Long id);
    PermissionResource findById(Long id);
    List<Permission> getAll(Map<String, String[]> parameters);
}
