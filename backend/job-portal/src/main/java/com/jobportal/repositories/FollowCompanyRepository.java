package com.jobportal.repositories;

import com.jobportal.entities.FollowCompany;
import com.jobportal.entities.FollowCompanyId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FollowCompanyRepository extends JpaRepository<FollowCompany, FollowCompanyId> {
    boolean existsByUser_IdAndCompany_Id(Long userId, Long companyId);
    void deleteByUser_IdAndCompany_Id(Long userId, Long companyId);
    long countByCompany_Id(Long companyId);
    Page<FollowCompany> findByUser_Id(Long userId, Pageable pageable);
}
