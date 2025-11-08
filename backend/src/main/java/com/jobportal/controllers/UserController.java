package com.jobportal.controllers;

import com.jobportal.dtos.requests.updation.RolesForUserUpdationRequest;
import com.jobportal.dtos.requests.updation.UserUpdationRequest;
import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.UserDetailsResource;
import com.jobportal.dtos.resources.UserProfileResource;
import com.jobportal.dtos.resources.UserResource;
import com.jobportal.entities.User;
import com.jobportal.mappers.UserMapper;
import com.jobportal.securities.exceptions.BusinessException;
import com.jobportal.securities.helps.details.CustomUserDetails;
import com.jobportal.services.interfaces.AuthServiceInterface;
import com.jobportal.services.interfaces.UserServiceInterface;
import com.jobportal.services.interfaces.UserSkillServiceInterface;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("api/users")
public class UserController {

    private final UserServiceInterface userService;
    private final UserMapper userMapper;
    private final UserSkillServiceInterface userSkillService;
    private final AuthServiceInterface authService; // nếu không dùng, có thể xoá

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ApiResource<UserProfileResource> me(@AuthenticationPrincipal CustomUserDetails user) {
        UserProfileResource me = authService.getProfileById(user.getUserId());
        return ApiResource.ok(me, "SUCCESS");
    }

    @PreAuthorize("hasPermission(null , 'UPDATE_USER')")
    @PutMapping("/{id}")
    public ApiResource<UserDetailsResource> updateRolesForUser(
            @Valid @RequestBody RolesForUserUpdationRequest request,
            @PathVariable @Positive(message = "id phải lớn hơn 0") Long id
    ) {
        UserDetailsResource resource = authService.updateRolesForUser(request.getRoleIds(), id);
        return ApiResource.ok(resource, "Cập nhật bản ghi thành công");
    }

    @PreAuthorize("hasPermission(null , 'READ_USER')")
    @GetMapping("/list")
    public ApiResource<List<UserResource>> list(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        List<User> users = userService.getAll(params);
        return ApiResource.ok(userMapper.tResourceList(users), "SUCCESS");
    }

    @PreAuthorize("hasPermission(null , 'READ_USER')")
    @GetMapping
    public ApiResource<Page<UserResource>> index(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        Page<User> users = userService.paginate(params);
        return ApiResource.ok(userMapper.tResourcePage(users), "SUCCESS");
    }

    @PreAuthorize("hasPermission(null , 'READ_USER')")
    @GetMapping("/profile/{id}")
    public ApiResource<UserDetailsResource> profile(@PathVariable @Positive(message = "id phải lớn hơn 0") Long id) {
        UserDetailsResource resource = userService.getById(id);
        return ApiResource.ok(resource, "SUCCESS");
    }

    @PreAuthorize("hasPermission(null , 'UPDATE_USER')")
    @PutMapping("/profile/{id}")
    public ApiResource<UserProfileResource> updateProfile(
            @Valid @RequestBody UserUpdationRequest request,
            @PathVariable @Positive(message = "id phải lớn hơn 0") Long id
    ) {
        UserProfileResource resource = userService.update(id, request);
        return ApiResource.ok(resource, "Cập nhật bản ghi thành công");
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/profile/me")
    public ApiResource<UserProfileResource> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody UserUpdationRequest request
    ) {
        UserProfileResource resource = userService.update(user.getUserId(), request);
        return ApiResource.ok(resource, "Cập nhật bản ghi thành công");
    }

    @PreAuthorize("hasPermission(null , 'DELETE_USER')")
    @DeleteMapping("/{id}")
    public ApiResource<Void> delete(@PathVariable @Positive(message = "id phải lớn hơn 0") Long id) {
        userService.delete(id);
        return ApiResource.ok(null, "Xóa bản ghi thành công");
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResource<String> uploadAvatar(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestPart("file") MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("BAD_REQUEST", "File rỗng hoặc thiếu part 'file'", HttpStatus.BAD_REQUEST);
        }
        String avatarUrl = userService.uploadAvatar(user.getUserId(), file);
        return ApiResource.ok(avatarUrl, "Upload avatar thành công");
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/skills/{slug}")
    public ApiResource<Void> addSkillToUser(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable String slug
    ) {
        userSkillService.addSkillToUser(user.getUserId(), slug);
        return ApiResource.ok(null, "Thêm kỹ năng cho người dùng thành công");
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/skills")
    public ApiResource<?> getSkillsForUser(@AuthenticationPrincipal CustomUserDetails user) {
        var skills = userSkillService.getSkillsById(user.getUserId());
        return ApiResource.ok(skills, "Success");
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/skills/{slug}")
    public ApiResource<Void> removeSkillFromUser(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable String slug
    ) {
        userSkillService.removeSkillFromUser(user.getUserId(), slug);
        return ApiResource.ok(null, "Xóa kỹ năng khỏi người dùng thành công");
    }
}
