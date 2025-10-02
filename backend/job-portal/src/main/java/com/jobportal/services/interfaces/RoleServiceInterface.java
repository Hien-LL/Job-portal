package com.jobportal.services.interfaces;

import com.jobportal.dtos.requests.RoleCreationRequest;
import com.jobportal.dtos.requests.RoleUpdationRequest;
import com.jobportal.dtos.resources.RoleDetailsResource;
import com.jobportal.dtos.resources.RoleResource;
import com.jobportal.entities.Role;
import org.springframework.data.domain.Page;
import java.util.List;
import java.util.Map;
import java.util.Set;

public interface RoleServiceInterface {
    List<Role> getAll(Map<String, String[]> parameters);
    Role create(RoleCreationRequest request);
    Role update(Long id, RoleUpdationRequest request);
    Page<Role> paginate(Map<String, String[]> parameters);
    RoleDetailsResource findById(Long id);
    void delete(Long id);
    RoleResource updatePermissionsForRole(Long roleId, Set<Long> permissionIds);
}