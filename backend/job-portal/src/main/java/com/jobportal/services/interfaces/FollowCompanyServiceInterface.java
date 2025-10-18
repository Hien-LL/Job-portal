package com.jobportal.services.interfaces;

public interface FollowCompanyServiceInterface {
    void followCompany(Long userId, Long companyId);
    void unfollowCompany(Long userId, Long companyId);
}
