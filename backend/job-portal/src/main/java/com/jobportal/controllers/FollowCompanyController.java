package com.jobportal.controllers;

import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.securities.helps.details.CustomUserDetails;
import com.jobportal.services.impl.FollowCompanyService;
import com.jobportal.services.interfaces.AuthServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follow-company")
@RequiredArgsConstructor
public class FollowCompanyController {

    private final FollowCompanyService followCompanyService;

    @PreAuthorize("isAuthenticated()")
    @PostMapping("{companyId}/follow")
    public ApiResource<Void> followCompany(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long companyId
    ) {
        Long userId = user.getUserId();
        followCompanyService.followCompany(userId, companyId);
        return ApiResource.ok(null, "Theo dõi công ty thành công");
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("{companyId}/unfollow")
    public ApiResource<Void> unfollowCompany(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long companyId
    ) {
        Long userId = user.getUserId();
        followCompanyService.unfollowCompany(userId, companyId);
        return ApiResource.ok(null, "Bỏ theo dõi công ty thành công");
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("{companyId}/is-following")
    public ApiResource<Boolean> isFollowing(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long companyId
    ) {
        Long userId = user.getUserId();
        boolean isFollowing = followCompanyService.isFollowing(userId, companyId);
        return ApiResource.ok(isFollowing, "Kiểm tra trạng thái theo dõi công ty thành công");
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("followed-companies")
    public ApiResource<?> getFollowedCompanies(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        Long userId = user.getUserId();
        var companies = followCompanyService.tCompanies(userId);
        return ApiResource.ok(companies, "Lấy danh sách công ty đã theo dõi thành công");
    }
}
