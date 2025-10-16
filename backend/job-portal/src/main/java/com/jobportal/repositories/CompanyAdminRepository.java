package com.jobportal.repositories;

import com.jobportal.entities.CompanyAdmin;
import com.jobportal.entities.CompanyAdminId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyAdminRepository extends JpaRepository<CompanyAdmin, CompanyAdminId> {
    boolean existsById(CompanyAdminId id);
    boolean existsByUser_IdAndCompany_Id(Long userId, Long companyId);
}


