package com.jobportal.controllers;

import com.jobportal.dtos.requests.RolesForUserUpdationRequest;
import com.jobportal.dtos.requests.UserUpdationRequest;
import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.UserDetailsResource;
import com.jobportal.dtos.resources.UserProfileResource;
import com.jobportal.dtos.resources.UserResource;
import com.jobportal.entities.User;
import com.jobportal.mappers.UserMapper;
import com.jobportal.services.interfaces.AuthServiceInterface;
import com.jobportal.services.interfaces.UserServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/users")
public class UserController {
    private final AuthServiceInterface authService;
    private final UserServiceInterface userService;
    private final UserMapper userMapper;

    @PreAuthorize("isAuthenticated()")
    @RequestMapping("/me")
    public ResponseEntity<?> me() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            UserDetailsResource userDetailsResource = authService.getUserFromEmail(email);
            ApiResource<UserDetailsResource> response = ApiResource.ok(userDetailsResource, "SUCCESS");

            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResource.error("NOT_FOUND", exception.getMessage(), HttpStatus.NOT_FOUND)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR
                    ));
        }
    }

    @PreAuthorize("hasPermission(null , 'UPDATE_USER')")
    @PutMapping("/{id}")
    public  ResponseEntity<?> updateRolesForUser(@Valid @RequestBody RolesForUserUpdationRequest request, @PathVariable @Positive(message = "id phải lớn hơn 0") Long id) {
        try {
            UserDetailsResource resource = authService.updateRolesForUser(request.getRoleIds(), id);
            ApiResource<UserDetailsResource> response = ApiResource.ok(resource, "Cập nhật bản ghi thành công");
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR
                    ));
        }
    }

    @PreAuthorize("hasPermission(null , 'READ_USER')")
    @GetMapping("/list")
    public ResponseEntity<?> list(HttpServletRequest request) {
        Map<String, String[]> parameterMap = request.getParameterMap();
        List<User> users = userService.getAll(parameterMap);
        List<UserResource> userResources = userMapper.tResourceList(users);

        ApiResource<java.util.List<UserResource>> response = ApiResource.ok(userResources, " SUCCESS");
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasPermission(null , 'READ_USER')")
    @GetMapping
    public ResponseEntity<?> index(HttpServletRequest request) {
        Map<String, String[]> parameters = request.getParameterMap();
        Page<User> users = userService.paginate(parameters);

        Page<UserResource> userResources = userMapper.tResourcePage(users);

        ApiResource<?> response = ApiResource.ok(userResources,
                " SUCCESS");
        return ResponseEntity.ok(response);
    }
    @PreAuthorize("hasPermission(null , 'READ_USER')")
    @GetMapping("/profile/{id}")
    public ResponseEntity<?> profile(@PathVariable @Positive(message = "id phải lớn hơn 0") Long id) {
        try {
            UserDetailsResource resource = userService.getById(id);
            ApiResource<UserDetailsResource> response = ApiResource.ok(resource, " SUCCESS");
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR
                    ));
        }
    }
    @PreAuthorize("hasPermission(null , 'UPDATE_USER')")
    @PutMapping("/profile/{id}")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UserUpdationRequest request, @PathVariable @Positive(message = "id phải lớn hơn 0") Long id) {
        try {
            UserProfileResource resource = userService.update(id, request);
            ApiResource<UserProfileResource> response = ApiResource.ok(resource, "Cập nhật bản ghi thành công");
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR
                    ));
        }
    }

    @PreAuthorize("hasPermission(null , 'DELETE_USER')")
    @DeleteMapping({"/{id}"})
    public ResponseEntity<?> delete(@PathVariable @Positive(message = "id phải lớn hơn 0") Long id) {
        try {
            userService.delete(id);
            return ResponseEntity.ok(ApiResource.ok(null, "Xóa bản ghi thành công"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR
                    ));
        }
    }
}
