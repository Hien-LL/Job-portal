package com.jobportal.mappers;

import com.jobportal.commons.BaseMapper;
import com.jobportal.dtos.requests.creation.PermissionCreationRequest;
import com.jobportal.dtos.requests.updation.PermissionUpdationRequest;
import com.jobportal.dtos.resources.PermissionResource;
import com.jobportal.entities.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper extends BaseMapper<Permission, PermissionResource, PermissionCreationRequest, PermissionUpdationRequest> {

}
