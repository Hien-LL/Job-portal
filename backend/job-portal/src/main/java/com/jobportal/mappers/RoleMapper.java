package com.jobportal.mappers;

import com.jobportal.dtos.requests.RoleCreationRequest;
import com.jobportal.dtos.resources.RoleDetailsResource;
import com.jobportal.dtos.resources.RoleResource;
import com.jobportal.entities.Role;
import org.mapstruct.Mapper;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PermissionMapper.class})
public interface RoleMapper {
    RoleResource tResource(Role role);
    RoleDetailsResource tResourceDetails(Role role);
    Role tEntity(RoleCreationRequest request);
    List<RoleResource> tResourceList(List<Role> roles);
    default Page<RoleResource> tResourcePage(Page<Role> roles) {
        return roles.map(this::tResource);
    }
}
