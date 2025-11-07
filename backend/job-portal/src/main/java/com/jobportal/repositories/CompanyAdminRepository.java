package com.jobportal.repositories;

import com.jobportal.entities.Company;
import com.jobportal.entities.CompanyAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyAdminRepository extends JpaRepository<CompanyAdmin, Long> {
    boolean existsByUser_Id(Long userId);
    Optional<CompanyAdmin> findByUser_Id(Long userId);
    // CompanyAdminRepository.java
    @Query("select ca.company from CompanyAdmin ca where ca.user.id = :userId")
    Optional<Company> findCompanyByAdminUserId(@Param("userId") Long userId);

    boolean existsByCompany_IdAndUser_Id(Long companyId, Long userId);

    List<Long> findCompanyIdsByUserId(Long actorUserId);
}


