package com.jobportal.controllers;

import com.jobportal.dtos.requests.RoleCreationRequest;
import com.jobportal.dtos.requests.RolePermissionUpdationRequest;
import com.jobportal.dtos.requests.RoleUpdationRequest;
import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.RoleDetailsResource;
import com.jobportal.dtos.resources.RoleResource;
import com.jobportal.entities.Role;
import com.jobportal.mappers.RoleMapper;
import com.jobportal.securities.exceptions.DuplicateResourceException;
import com.jobportal.services.interfaces.RoleServiceInterface;
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

@Validated
@Controller
@RequiredArgsConstructor
@RequestMapping("api/v1/roles")
public class RoleController {

    private final RoleServiceInterface roleService;
    private final RoleMapper roleMapper;

    @PreAuthorize("hasPermission(null , 'READ_ROLE')")
    @GetMapping("/list")
    public ResponseEntity<?> list(HttpServletRequest request) {
        Map<String, String[]> parameterMap = request.getParameterMap();
        List<Role> roles = roleService.getAll(parameterMap);
        List<RoleResource> roleResources = roleMapper.tResourceList(roles);

        ApiResource<List<RoleResource>> response = ApiResource.ok(roleResources, " SUCCESS");
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasPermission(null , 'READ_ROLE')")
    @GetMapping
    public ResponseEntity<?> index(HttpServletRequest request)
    {
        Map<String, String[]> parameters = request.getParameterMap();
        Page<Role> roles = roleService.paginate(parameters);

        Page<RoleResource> roleResources = roleMapper.tResourcePage(roles);
        ApiResource<Page<RoleResource>> response = ApiResource.ok(roleResources,
                " SUCCESS");
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasPermission(null , 'CREATE_ROLE')")
    @PostMapping
    public ResponseEntity<?> store(@Valid @RequestBody RoleCreationRequest request) {
        try {
            Role role = roleService.create(request);
            RoleResource roleResource = roleMapper.tResource(role);
            ApiResource<RoleResource> response = ApiResource.ok(roleResource, "Thêm bản ghi thành công");
            return ResponseEntity.ok(response);
        } catch (DuplicateResourceException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    ApiResource.error("DUPLICATE_RESOURCE", e.getMessage(), HttpStatus.CONFLICT)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResource.error("INTERNAL_SERVER_ERROR", "Có lỗi xảy ra trong quá trình thêm mới", HttpStatus.INTERNAL_SERVER_ERROR
                    ));
        }
    }

    @PreAuthorize("hasPermission(null , 'UPDATE_ROLE')")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@Valid @RequestBody RoleUpdationRequest request, @PathVariable @Positive(message = "id phải lớn hơn 0") Long id) {
        try {
            Role role = roleService.update(id, request);
            RoleResource roleResource = roleMapper.tResource(role);

            ApiResource<RoleResource> response = ApiResource.ok(roleResource, "Cập nhật bản ghi thành công");
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResource.error("INTERNAL_SERVER_ERROR", "Có lỗi xảy ra trong quá trình cập nhật", HttpStatus.INTERNAL_SERVER_ERROR
                    ));
        }
    }

    @PreAuthorize("hasPermission(null , 'UPDATE_ROLE')")
    @PutMapping("/permissions/{id}")
    public ResponseEntity<?> updatePermissionsForRole(@Valid @RequestBody RolePermissionUpdationRequest request, @PathVariable @Positive(message = "id phải lớn hơn 0") Long id) {
        try {
            RoleResource resource = roleService.updatePermissionsForRole(id, request.getPermissionIds());
            ApiResource<RoleResource> response = ApiResource.ok(resource, "Cập nhật bản ghi thành công");
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResource.error("INTERNAL_SERVER_ERROR", "Có lỗi xảy ra trong quá trình cập nhật", HttpStatus.INTERNAL_SERVER_ERROR
                    ));
        }
    }

    @PreAuthorize("hasPermission(null , 'READ_ROLE')")
    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable @Positive(message = "id phải lớn hơn 0") Long id) {
        try {
            RoleDetailsResource data = roleService.findById(id);
            ApiResource<RoleDetailsResource> response = ApiResource.ok(data, "Success");
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResource.error("INTERNAL_SERVER_ERROR", "Có lỗi xảy ra trong quá trình cập nhật", HttpStatus.INTERNAL_SERVER_ERROR
                    ));
        }
    }

    @PreAuthorize("hasPermission(null , 'DELETE_ROLE')")
    @DeleteMapping("/{id}")
    public  ResponseEntity<?> delete(@PathVariable @Positive(message = "id phải lớn hơn 0") Long id) {
        try {
            roleService.delete(id);
            return ResponseEntity.status(HttpStatus.OK).body(
                    ApiResource.ok(null, "Xóa bản ghi thành công")
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
