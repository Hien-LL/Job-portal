package com.jobportal.repositories;

import com.jobportal.entities.FollowCompany;
import com.jobportal.entities.FollowCompanyId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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

    interface CompanyListItemProjection {
        Long getId();
        String getName();
        String getSlug();
        String getLogoUrl();
        boolean isVerified();
    }

    @Query(value = """
    SELECT c.id AS id, c.name AS name, c.slug AS slug, c.logo_url AS logoUrl, c.verified AS verified
    FROM companies c
    INNER JOIN follow_companies f ON c.id = f.company_id
    WHERE f.user_id = :userId
    """, nativeQuery = true)
    List<CompanyListItemProjection> findCompaniesByUserIdNative(@Param("userId") Long userId);

    @Query("SELECT COUNT(f) FROM FollowCompany f WHERE f.company.id = :companyId")
    int countFollowers(Long companyId);

    @Modifying
    @Query("DELETE FROM FollowCompany f WHERE f.company.id = :companyId")
    void deleteByCompanyId(@Param("companyId") Long companyId);
}
