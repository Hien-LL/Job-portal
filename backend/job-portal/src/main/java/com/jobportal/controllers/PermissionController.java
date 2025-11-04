package com.jobportal.controllers;

import com.jobportal.dtos.requests.creation.PermissionCreationRequest;
import com.jobportal.dtos.requests.updation.PermissionUpdationRequest;
import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.PermissionResource;
import com.jobportal.entities.Permission;
import com.jobportal.mappers.PermissionMapper;
import com.jobportal.services.interfaces.PermissionServiceInterface;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Validated
@RestController
@RequestMapping("api/permissions")
public class PermissionController {

    private final PermissionServiceInterface permissionService;
    private final PermissionMapper permissionMapper;

    @PreAuthorize("hasPermission(null , 'READ_PERMISSION')")
    @GetMapping("/list")
    public ApiResource<List<PermissionResource>> list(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        List<Permission> permissions = permissionService.getAll(params);
        return ApiResource.ok(permissionMapper.tResourceList(permissions), "Success");
    }

    @PreAuthorize("hasPermission(null , 'READ_PERMISSION')")
    @GetMapping
    public ApiResource<Page<PermissionResource>> index(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        Page<Permission> page = permissionService.paginate(params);
        return ApiResource.ok(permissionMapper.tResourcePage(page), "Success");
    }

    @PreAuthorize("hasPermission(null , 'READ_PERMISSION')")
    @GetMapping("/{id}")
    public ApiResource<PermissionResource> findById(@PathVariable @Positive(message = "id phải lớn hơn 0") Long id) {
        PermissionResource data = permissionService.findById(id);
        return ApiResource.ok(data, "Success");
    }

    @PreAuthorize("hasPermission(null , 'CREATE_PERMISSION')")
    @PostMapping
    public ApiResource<PermissionResource> create(@Valid @RequestBody PermissionCreationRequest request) {
        Permission permission = permissionService.create(request);
        return ApiResource.ok(permissionMapper.tResource(permission), "Thêm bản ghi thành công");
    }

    @PreAuthorize("hasPermission(null , 'UPDATE_PERMISSION')")
    @PutMapping("/{id}")
    public ApiResource<PermissionResource> update(
            @PathVariable @Positive(message = "id phải lớn hơn 0") Long id,
            @Valid @RequestBody PermissionUpdationRequest request
    ) {
        Permission permission = permissionService.update(id, request);
        return ApiResource.ok(permissionMapper.tResource(permission), "Cập nhật thành công quyền người dùng");
    }

    @PreAuthorize("hasPermission(null , 'DELETE_PERMISSION')")
    @DeleteMapping("/{id}")
    public ApiResource<Void> delete(@PathVariable @Positive(message = "id phải lớn hơn 0") Long id) {
        permissionService.delete(id);
        return ApiResource.ok(null, "Xoá quyền người dùng thành công với id: " + id);
    }
}
