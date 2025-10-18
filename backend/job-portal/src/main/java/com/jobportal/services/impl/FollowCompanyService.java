package com.jobportal.services.impl;

import com.jobportal.entities.Company;
import com.jobportal.entities.FollowCompany;
import com.jobportal.entities.FollowCompanyId;
import com.jobportal.entities.User;
import com.jobportal.repositories.CompanyRepository;
import com.jobportal.repositories.FollowCompanyRepository;
import com.jobportal.repositories.UserRepository;
import com.jobportal.services.interfaces.FollowCompanyServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FollowCompanyService implements FollowCompanyServiceInterface {
    private final FollowCompanyRepository followCompanyRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;

    @Override
    public void followCompany(Long userId, Long companyId) {
        if (followCompanyRepository.existsByUser_IdAndCompany_Id(userId, companyId)) {
            throw new IllegalArgumentException("Người dùng đã theo dõi công ty này.");
        }
        User user = userRepository.findById(userId).orElseThrow();
        Company company = companyRepository.findById(companyId).orElseThrow();
        followCompanyRepository.save(new FollowCompany(user, company));
    }

    @Override
    public void unfollowCompany(Long userId, Long companyId) {
        if (!followCompanyRepository.existsByUser_IdAndCompany_Id(userId, companyId)) {
            throw new IllegalArgumentException("Người dùng chưa theo dõi công ty này.");
        }
        followCompanyRepository.deleteById(new FollowCompanyId(userId, companyId));
    }
}
