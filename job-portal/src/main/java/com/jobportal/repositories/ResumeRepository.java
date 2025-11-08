package com.jobportal.repositories;

import com.jobportal.entities.Resume;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long>, JpaSpecificationExecutor<Resume> {

    // LIST: không kéo children
    List<Resume> findByUserIdOrderByIdDesc(Long userId);
    List<Resume> findByUserIdAndIsDefaultOrderByIdDesc(Long userId, boolean isDefault);


    Optional<Resume> findFirstByUserIdAndIsDefaultTrue(Long userId);


    // DETAIL: join fetch 1 collection; phần còn lại SUBSELECT
    @Query("""
      select r from Resume r
      left join fetch r.experiences e
      where r.id = :id and r.user.id = :userId
    """)
    Optional<Resume> fetchDetailWithExperiences(@Param("id") Long id, @Param("userId") Long userId);

    boolean existsByIdAndUserId(Long resumeId, Long userId);
}
