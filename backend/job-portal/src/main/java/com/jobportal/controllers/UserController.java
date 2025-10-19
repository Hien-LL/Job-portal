package com.jobportal.controllers;

import com.jobportal.dtos.requests.NotificationRequest;
import com.jobportal.dtos.requests.RolesForUserUpdationRequest;
import com.jobportal.dtos.requests.UserUpdationRequest;
import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.UserDetailsResource;
import com.jobportal.dtos.resources.UserProfileResource;
import com.jobportal.dtos.resources.UserResource;
import com.jobportal.entities.User;
import com.jobportal.mappers.UserMapper;
import com.jobportal.services.interfaces.AuthServiceInterface;
import com.jobportal.services.interfaces.NotificationServiceInterface;
import com.jobportal.services.interfaces.UserServiceInterface;
import com.jobportal.services.interfaces.UserSkillServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/users")
public class UserController {
    private final AuthServiceInterface authService;
    private final UserServiceInterface userService;
    private final UserMapper userMapper;
    private final UserSkillServiceInterface userSkillService;
    private final NotificationServiceInterface notificationService;

    @PreAuthorize("isAuthenticated()")
    @RequestMapping("/me")
    public ResponseEntity<?> me() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            UserProfileResource userResource =  authService.getUserFromEmail(email);
            ApiResource<UserProfileResource> response = ApiResource.ok(userResource, "SUCCESS");

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

    @PreAuthorize("isAuthenticated()")
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAvatar(@RequestPart("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(
                        ApiResource.error("BAD_REQUEST", "File rỗng hoặc thiếu part 'file'", HttpStatus.BAD_REQUEST)
                );
            }

            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            UserProfileResource user = authService.getUserFromEmail(email);

            String avatarUrl = userService.uploadAvatar(user.getId(), file);
            return ResponseEntity.ok(ApiResource.ok(avatarUrl, "Upload avatar thành công"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @PostMapping("/skills/{slug}")
    ResponseEntity<?> addSkillToUser(@PathVariable String slug, @RequestParam int yearsExperience) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            UserProfileResource user = authService.getUserFromEmail(email);

            userSkillService.addSkillToUser(user.getId(), slug, yearsExperience);
            return ResponseEntity.ok(ApiResource.ok(null, "Thêm kỹ năng cho người dùng thành công"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResource.error("BAD_REQUEST", e.getMessage(), HttpStatus.BAD_REQUEST));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @GetMapping("/skills")
    ResponseEntity<?> getSkillsForUser() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            UserProfileResource user = authService.getUserFromEmail(email);

            var skills = userSkillService.getSkillsById(user.getId());
            return ResponseEntity.ok(ApiResource.ok(skills, "Success"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResource.error("BAD_REQUEST", e.getMessage(), HttpStatus.BAD_REQUEST));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @PutMapping("/skills/{slug}")
    ResponseEntity<?> updateSkillForUser(@PathVariable String slug, @RequestParam int yearsExperience) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            UserProfileResource user = authService.getUserFromEmail(email);

            userSkillService.updateYearsBySlug(user.getId(), slug, yearsExperience);
            return ResponseEntity.ok(ApiResource.ok(null, "Cập nhật số năm kinh nghiệm cho kỹ năng thành công"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResource.error("BAD_REQUEST", e.getMessage(), HttpStatus.BAD_REQUEST));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @DeleteMapping("/skills/{slug}")
    ResponseEntity<?> removeSkillFromUser(@PathVariable String slug) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            UserProfileResource user = authService.getUserFromEmail(email);

            userSkillService.removeSkillFromUser(user.getId(), slug);
            return ResponseEntity.ok(ApiResource.ok(null, "Xóa kỹ năng khỏi người dùng thành công"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResource.error("BAD_REQUEST", e.getMessage(), HttpStatus.BAD_REQUEST));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
