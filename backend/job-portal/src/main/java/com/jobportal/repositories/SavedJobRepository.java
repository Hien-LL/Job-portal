package com.jobportal.repositories;

import com.jobportal.dtos.resources.SavedJobResource;
import com.jobportal.entities.SavedJob;
import com.jobportal.entities.SavedJobId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, SavedJobId> {

    boolean existsById(SavedJobId id);

    @Query(
            value = """
            select new com.jobportal.dtos.resources.SavedJobResource(
                sj.id.jobId,
                j.title,
                j.slug,
                j.company.name,
                j.company.logoUrl,
                coalesce(l.displayName, concat(l.city, ', ', l.countryCode)),
                j.isRemote,
                j.salaryMin,
                j.salaryMax,
                j.currency,
                j.employmentType,
                sj.savedAt,
                j.expiresAt,
                (case when j.expiresAt < CURRENT_TIMESTAMP then true else false end)
            )
            from SavedJob sj
            join sj.job j
            left join j.location l
            where sj.id.userId = :userId
            """,
            countQuery = """
            select count(sj)
            from SavedJob sj
            where sj.id.userId = :userId
            """
    )
    Page<SavedJobResource> findPageByUserId(Long userId, Pageable pageable);

    boolean existsByUserIdAndJobSlug(Long userId, String jobSlug);
}

