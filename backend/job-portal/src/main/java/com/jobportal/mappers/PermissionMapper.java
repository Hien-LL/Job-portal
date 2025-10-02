package com.jobportal.mappers;

import com.jobportal.dtos.requests.PermissionCreationRequest;
import com.jobportal.dtos.resources.PermissionResource;
import com.jobportal.entities.Permission;
import org.mapstruct.Mapper;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    PermissionResource tResource(Permission permission);
    Permission tEntity(PermissionCreationRequest request);
    List<PermissionResource> tResourceList(List<Permission> permissions);
    default Page<PermissionResource> tResourcePage(Page<Permission> permissions) {
        return permissions.map(this::tResource);
    }
}
