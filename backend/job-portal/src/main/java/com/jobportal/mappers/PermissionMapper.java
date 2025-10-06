package com.jobportal.mappers;

import com.jobportal.commons.BaseMapper;
import com.jobportal.dtos.requests.PermissionCreationRequest;
import com.jobportal.dtos.requests.PermissionUpdationRequest;
import com.jobportal.dtos.resources.PermissionResource;
import com.jobportal.entities.Permission;
import org.mapstruct.Mapper;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PermissionMapper extends BaseMapper<Permission, PermissionResource, PermissionCreationRequest, PermissionUpdationRequest> {

}
