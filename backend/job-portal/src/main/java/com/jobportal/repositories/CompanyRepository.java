package com.jobportal.repositories;

import com.jobportal.entities.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    @Query("""
        select distinct c
        from Company c
        join c.companyAdmins ca
        where ca.user.id = :userId
        order by c.name asc
    """)
    List<Company> findAllByMemberUserId(Long userId);

    boolean existsBySlug(String slug);
}
