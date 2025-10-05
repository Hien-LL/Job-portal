package com.jobportal.controllers;

import com.jobportal.dtos.requests.PermissionCreationRequest;
import com.jobportal.dtos.requests.PermissionUpdationRequest;
import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.PermissionResource;
import com.jobportal.entities.Permission;
import com.jobportal.mappers.PermissionMapper;
import com.jobportal.securities.exceptions.DuplicateResourceException;
import com.jobportal.services.interfaces.PermissionServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Validated
@Controller
@RequestMapping("api/permissions")
public class PermissionController {
    private final PermissionServiceInterface permissionService;
    private final PermissionMapper permissionMapper;


    @PreAuthorize("hasPermission(null , 'READ_PERMISSION')")
    @GetMapping("/list")
    public ResponseEntity<?> list(HttpServletRequest request) {
        Map<String, String[]> parameter = request.getParameterMap();
        List<Permission> permissions =  permissionService.getAll(parameter);
        List<PermissionResource> permissionResources = permissionMapper.tResourceList(permissions);

        ApiResource<List<PermissionResource>> resource = ApiResource.ok(permissionResources, "Success");
        return ResponseEntity.ok(resource);
    }

    @PreAuthorize("hasPermission(null , 'READ_PERMISSION')")
    @GetMapping
    public ResponseEntity<?> index(HttpServletRequest request) {
        Map<String, String[]> parameter = request.getParameterMap();
        Page<Permission> permissions =  permissionService.paginate(parameter);
        Page<PermissionResource> permissionResources = permissionMapper.tResourcePage(permissions);

        ApiResource<Page<PermissionResource>> resource = ApiResource.ok(permissionResources, "Success");
        return ResponseEntity.ok(resource);
    }

    @PreAuthorize("hasPermission(null , 'READ_PERMISSION')")
    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable @Positive(message = "id phải lớn hơn 0") Long id) {
        try {
            PermissionResource data = permissionService.findById(id);

            ApiResource<PermissionResource> response = ApiResource.ok(data, "Success");
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResource.error("INTERNAL_SERVER_ERROR", "Có lỗi xảy ra trong quá trình lấy dữ liệu", HttpStatus.INTERNAL_SERVER_ERROR)
            );
        }
    }

    @PreAuthorize("hasPermission(null , 'CREATE_PERMISSION')")
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody PermissionCreationRequest request) {
        try {
            Permission permission= permissionService.create(request);
            PermissionResource resource = permissionMapper.tResource(permission);

            ApiResource<PermissionResource> response = ApiResource.ok(resource, "Thêm bản ghi thành công");
            return ResponseEntity.ok(response);
        } catch (DuplicateResourceException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ApiResource.error("BAD_REQUEST", e.getMessage(), HttpStatus.BAD_REQUEST)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResource.error("INTERNAL_SERVER_ERROR", "Có lỗi xảy ra trong quá trình tạo mới", HttpStatus.INTERNAL_SERVER_ERROR)
            );
        }
    }

    @PreAuthorize("hasPermission(null , 'UPDATE_PERMISSION')")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable @Positive(message = "id phải lớn hơn 0") Long id, @Valid @RequestBody PermissionUpdationRequest request) {
        try {
            Permission permission = permissionService.update(id, request);
            PermissionResource resource = permissionMapper.tResource(permission);

            ApiResource<PermissionResource> response = ApiResource.ok(resource, "Cập nhật thành công quyền người dùng");
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResource.error("INTERNAL_SERVER_ERROR", "Có lỗi xảy ra trong quá trình cập nhật", HttpStatus.INTERNAL_SERVER_ERROR)
            );
        }
    }

    @PreAuthorize("hasPermission(null , 'DELETE_PERMISSION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable @Positive(message = "id phải lớn hơn 0") Long id) {
        try {
            permissionService.delete(id);

            return ResponseEntity.status(HttpStatus.OK).body(
                    ApiResource.ok(null, "Xoá quyền người dùng thành công với id: " + id)
            );
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResource.error("INTERNAL_SERVER_ERROR", "Có lỗi xảy ra trong quá trình cập nhật", HttpStatus.INTERNAL_SERVER_ERROR)
            );
        }
    }
}
