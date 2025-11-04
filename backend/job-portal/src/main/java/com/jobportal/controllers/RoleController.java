package com.jobportal.controllers;

import com.jobportal.dtos.requests.creation.RoleCreationRequest;
import com.jobportal.dtos.requests.updation.RolePermissionUpdationRequest;
import com.jobportal.dtos.requests.updation.RoleUpdationRequest;
import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.RoleDetailsResource;
import com.jobportal.dtos.resources.RoleResource;
import com.jobportal.entities.Role;
import com.jobportal.mappers.RoleMapper;
import com.jobportal.services.interfaces.RoleServiceInterface;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("api/roles")
public class RoleController {

    private final RoleServiceInterface roleService;
    private final RoleMapper roleMapper;

    @PreAuthorize("hasPermission(null , 'READ_ROLE')")
    @GetMapping("/list")
    public ApiResource<List<RoleResource>> list(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        List<Role> roles = roleService.getAll(params);
        return ApiResource.ok(roleMapper.tResourceList(roles), "SUCCESS");
    }

    @PreAuthorize("hasPermission(null , 'READ_ROLE')")
    @GetMapping
    public ApiResource<Page<RoleResource>> index(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        Page<Role> roles = roleService.paginate(params);
        return ApiResource.ok(roleMapper.tResourcePage(roles), "SUCCESS");
    }

    @PreAuthorize("hasPermission(null , 'READ_ROLE')")
    @GetMapping("/{id}")
    public ApiResource<RoleDetailsResource> findById(
            @PathVariable @Positive(message = "id phải lớn hơn 0") Long id
    ) {
        RoleDetailsResource data = roleService.findById(id);
        return ApiResource.ok(data, "SUCCESS");
    }

    @PreAuthorize("hasPermission(null , 'CREATE_ROLE')")
    @PostMapping
    public ApiResource<RoleResource> store(@Valid @RequestBody RoleCreationRequest request) {
        Role role = roleService.create(request);
        return ApiResource.ok(roleMapper.tResource(role), "Thêm bản ghi thành công");
    }

    @PreAuthorize("hasPermission(null , 'UPDATE_ROLE')")
    @PutMapping("/{id}")
    public ApiResource<RoleResource> update(
            @Valid @RequestBody RoleUpdationRequest request,
            @PathVariable @Positive(message = "id phải lớn hơn 0") Long id
    ) {
        Role role = roleService.update(id, request);
        return ApiResource.ok(roleMapper.tResource(role), "Cập nhật bản ghi thành công");
    }

    @PreAuthorize("hasPermission(null , 'UPDATE_ROLE')")
    @PutMapping("/permissions/{id}")
    public ApiResource<RoleResource> updatePermissionsForRole(
            @Valid @RequestBody RolePermissionUpdationRequest request,
            @PathVariable @Positive(message = "id phải lớn hơn 0") Long id
    ) {
        RoleResource resource = roleService.updatePermissionsForRole(id, request.getPermissionIds());
        return ApiResource.ok(resource, "Cập nhật bản ghi thành công");
    }

    @PreAuthorize("hasPermission(null , 'DELETE_ROLE')")
    @DeleteMapping("/{id}")
    public ApiResource<Void> delete(
            @PathVariable @Positive(message = "id phải lớn hơn 0") Long id
    ) {
        roleService.delete(id);
        return ApiResource.ok(null, "Xoá bản ghi thành công");
    }
}
