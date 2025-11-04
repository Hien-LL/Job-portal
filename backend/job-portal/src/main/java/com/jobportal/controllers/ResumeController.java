package com.jobportal.controllers;

import com.jobportal.dtos.requests.creation.ResumeCreationRequest;
import com.jobportal.dtos.requests.updation.ResumeUpdationRequest;
import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.ResumeFileResource;
import com.jobportal.dtos.resources.ResumeResource;
import com.jobportal.securities.helps.details.CustomUserDetails;
import com.jobportal.services.interfaces.ResumeFileServiceInterface;
import com.jobportal.services.interfaces.ResumeServiceInterface;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeServiceInterface resumeService;
    private final ResumeFileServiceInterface resumeFileService;

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ApiResource<List<ResumeResource>> getList(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(required = false) Boolean isDefault
    ) {
        Long userId = user.getUserId();
        List<ResumeResource> resumes = resumeService.getListById(userId, isDefault);
        return ApiResource.ok(resumes, "Success");
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{resumeId}")
    public ApiResource<ResumeResource> getDetail(
            @AuthenticationPrincipal CustomUserDetails user,
            @Positive(message = "id phải lớn hơn 0") @PathVariable Long resumeId
    ) {
        Long userId = user.getUserId();
        ResumeResource resume = resumeService.getDetail(userId, resumeId);
        return ApiResource.ok(resume, "Success");
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ApiResource<ResumeResource> create(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody @Valid ResumeCreationRequest request
    ) {
        Long userId = user.getUserId();
        ResumeResource result = resumeService.create(userId, request);
        return ApiResource.ok(result, "Created");
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{resumeId}")
    public ApiResource<ResumeResource> update(
            @AuthenticationPrincipal CustomUserDetails user,
            @Positive(message = "id phải lớn hơn 0") @PathVariable Long resumeId,
            @RequestBody @Valid ResumeUpdationRequest request
    ) {
        Long userId = user.getUserId();
        ResumeResource result = resumeService.update(userId, resumeId, request);
        return ApiResource.ok(result, "Updated");
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping(
            value = "/{resumeId}/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ApiResource<ResumeFileResource> uploadFile(
            @AuthenticationPrincipal CustomUserDetails user,
            @Positive(message = "id phải lớn hơn 0") @PathVariable Long resumeId,
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) String fileType
    ) {
        Long userId = user.getUserId();
        ResumeFileResource result = resumeFileService.upload(userId, resumeId, file, fileType);
        return ApiResource.ok(result, "Upload File thành công");
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/files/{resumeId}")
    public ApiResource<Void> deleteFile(
            @AuthenticationPrincipal CustomUserDetails user,
            @Positive(message = "id phải lớn hơn 0") @PathVariable Long resumeId
    ) {
        Long userId = user.getUserId();
        resumeFileService.deleteFile(userId, resumeId);
        return ApiResource.ok(null, "Xoá File thành công");
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{resumeId}")
    public ApiResource<Void> delete(
            @AuthenticationPrincipal CustomUserDetails user,
            @Positive(message = "id phải lớn hơn 0") @PathVariable Long resumeId
    ) {
        Long userId = user.getUserId();
        resumeService.delete(userId, resumeId);
        return ApiResource.ok(null, "Deleted");
    }
}
