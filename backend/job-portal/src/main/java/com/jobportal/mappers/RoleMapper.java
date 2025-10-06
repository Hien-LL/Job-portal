package com.jobportal.mappers;

import com.jobportal.commons.BaseMapper;
import com.jobportal.dtos.requests.RoleCreationRequest;
import com.jobportal.dtos.requests.RoleUpdationRequest;
import com.jobportal.dtos.resources.RoleDetailsResource;
import com.jobportal.dtos.resources.RoleResource;
import com.jobportal.entities.Role;
import org.mapstruct.Mapper;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PermissionMapper.class})
public interface RoleMapper extends BaseMapper<Role, RoleResource, RoleCreationRequest, RoleUpdationRequest> {
    RoleDetailsResource tResourceDetails(Role role);
}
