package com.jobportal.repositories;

import com.jobportal.entities.FollowCompany;
import com.jobportal.entities.FollowCompanyId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface FollowCompanyRepository extends JpaRepository<FollowCompany, FollowCompanyId> {
    boolean existsByUser_IdAndCompany_Id(Long userId, Long companyId);

    long countByCompany_Id(Long companyId);
    @Query("""
        select fc.company.id as companyId, count(fc.id) as cnt
        from FollowCompany fc
        where fc.company.id in :companyIds
        group by fc.company.id
    """)
    List<CompanyFollowAgg> countByCompanyIdsGrouped(@Param("companyIds") Collection<Long> companyIds);

    interface CompanyFollowAgg {
        Long getCompanyId();
        long getCnt();
    }
}
