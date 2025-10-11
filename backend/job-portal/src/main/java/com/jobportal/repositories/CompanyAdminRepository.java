package com.jobportal.repositories;

import com.jobportal.entities.CompanyAdmin;
import com.jobportal.entities.CompanyAdminId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyAdminRepository extends JpaRepository<CompanyAdmin, CompanyAdminId> {
    List<CompanyAdmin> findByUserId(Long userId);
    List<CompanyAdmin> findByCompanyId(Long companyId);
    boolean existsById(CompanyAdminId id);
}


