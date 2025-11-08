package com.jobportal.controllers;

import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.ResumeResource;
import com.jobportal.dtos.resources.UserProfileResource;
import com.jobportal.services.interfaces.AuthServiceInterface;
import com.jobportal.services.interfaces.ResumeServiceInterface;
import com.jobportal.services.interfaces.UserSkillServiceInterface;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/public")
public class ProfilePublicController {
    private final ResumeServiceInterface resumeService;
    private final UserSkillServiceInterface userSkillService;
    private final AuthServiceInterface authService;

    @GetMapping("resumes/{userId}")
    public ApiResource<List<ResumeResource>> getDefaultResumeByUserId(
            @Positive(message = "id phải lớn hơn 0") @PathVariable Long userId
    ) {
        List<ResumeResource> resumes = resumeService.getListById(userId, true);
        return ApiResource.ok(resumes, "Success");
    }

    @GetMapping("/skills/{userId}")
    public ApiResource<?> getSkillsForUserById(@PathVariable @Positive(message = "userId phải lớn hơn 0") Long userId) {
        var skills = userSkillService.getSkillsById(userId);
        return ApiResource.ok(skills, "Success");
    }

    @GetMapping("users/{id}")
    public ApiResource<UserProfileResource> getProfileById(@PathVariable @Positive(message = "id phải lớn hơn 0") Long id) {
        UserProfileResource userProfileResource = authService.getProfileById(id);
        return ApiResource.ok(userProfileResource, "SUCCESS");
    }
}
