package com.jobportal.services.interfaces;

import com.jobportal.dtos.resources.CompanyListItemResource;

import java.util.List;

public interface FollowCompanyServiceInterface {
    void followCompany(Long userId, Long companyId);
    void unfollowCompany(Long userId, Long companyId);
    boolean isFollowing(Long userId, Long companyId);
    List<CompanyListItemResource> tCompanies(Long userId);
}
