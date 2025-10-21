package com.jobportal.mappers;

import com.jobportal.commons.BaseMapper;
import com.jobportal.dtos.requests.creation.RoleCreationRequest;
import com.jobportal.dtos.requests.updation.RoleUpdationRequest;
import com.jobportal.dtos.resources.RoleDetailsResource;
import com.jobportal.dtos.resources.RoleResource;
import com.jobportal.entities.Role;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {PermissionMapper.class})
public interface RoleMapper extends BaseMapper<Role, RoleResource, RoleCreationRequest, RoleUpdationRequest> {
    RoleDetailsResource tResourceDetails(Role role);
}
