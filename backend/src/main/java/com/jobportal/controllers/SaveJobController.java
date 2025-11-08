package com.jobportal.controllers;

import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.SavedJobResource;
import com.jobportal.securities.helps.details.CustomUserDetails;
import com.jobportal.services.interfaces.SavedJobServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/saved-jobs")
@RequiredArgsConstructor
@Validated
public class SaveJobController {
    private final SavedJobServiceInterface savedJobService;

    @PostMapping("/{jobSlug}/save")
    public ApiResource<Void> saveJob(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable String jobSlug
    ) {
        Long userId = user.getUserId();
        savedJobService.saveJob(userId, jobSlug);
        return ApiResource.ok(null, "Lưu thành công job");
    }

    @RequestMapping(value = "saved-jobs/list", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResource<Page<SavedJobResource>> getSavedJobs(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long userId = user.getUserId();
        Page<SavedJobResource> resourcePage = savedJobService.getSavedJobsByUserId(userId, page, size);
        return ApiResource.ok(resourcePage, "Lấy danh sách công việc đã lưu thành công");
    }

    @DeleteMapping("/{jobSlug}/unsave")
    public ApiResource<Void> unsaveJob(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable String jobSlug
    ) {
        Long userId = user.getUserId();
        savedJobService.removeSavedJob(userId, jobSlug);
        return ApiResource.ok(null, "Bỏ lưu thành công job");
    }

    @GetMapping("{jobSlug}/is-saved")
    public ApiResource<Boolean> isJobSaved(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable String jobSlug
    ) {
        Long userId = user.getUserId();
        boolean isSaved = savedJobService.isJobSavedByUser(userId, jobSlug);
        return ApiResource.ok(isSaved, "Kiểm tra trạng thái lưu job thành công");
    }
}
