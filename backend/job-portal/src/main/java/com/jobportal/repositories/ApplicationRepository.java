package com.jobportal.repositories;

import com.jobportal.entities.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // Check double-apply
    boolean existsByUser_IdAndJob_Id(Long userId, Long jobId);

    @EntityGraph(attributePaths = {"status", "job"})
    Page<Application> findAllByUser_Id(Long userId, Pageable pageable);

    @Query(value = """
        select a from Application a
        join fetch a.status s
        join fetch a.job j
        where a.user.id = :userId
          and (:statusCode is null or s.code = :statusCode)
        """,
            countQuery = """
        select count(a) from Application a
        join a.status s
        where a.user.id = :userId
          and (:statusCode is null or s.code = :statusCode)
        """)
    Page<Application> findAllByUserIdAndStatus(
            @Param("userId") Long userId,
            @Param("statusCode") String statusCode,
            Pageable pageable);

    // List applications theo jobId + companyId (chắc chắn job thuộc company)
    @Query(value = """
        select a from Application a
        join fetch a.status s
        join fetch a.user u
        where a.job.id = :jobId
          and a.job.company.id = :companyId
          and (:statusCode is null or s.code = :statusCode)
        """,
            countQuery = """
        select count(a) from Application a
        join a.status s
        where a.job.id = :jobId
          and a.job.company.id = :companyId
          and (:statusCode is null or s.code = :statusCode)
        """)
    Page<Application> findAllForCompanyJob(
            @Param("companyId") Long companyId,
            @Param("jobId") Long jobId,
            @Param("statusCode") String statusCode,
            Pageable pageable);

    @Query("""
        select a from Application a
        join fetch a.status s
        join fetch a.job j
        join fetch a.user u
        where a.id = :id
    """)
    Optional<Application> findDetailById(@Param("id") Long id);

    @Query("""
      select a from Application a
      join fetch a.user u
      join fetch a.job j
      join fetch j.company c
      join fetch a.status s
      where a.id = :id
    """)
    Optional<Application> findByIdWithJoins(@Param("id") Long id);

    // 1) Ứng viên (owner) xem hồ sơ mình nộp
    @Query("""
        select distinct a from Application a
          join fetch a.status s
          join fetch a.user u
          left join fetch u.userSkills us
        where a.id = :applicationId
          and u.id = :actorUserId
    """)
    Optional<Application> findCandidateByIdForOwner(@Param("applicationId") Long applicationId,
                                                    @Param("actorUserId") Long actorUserId);

    // 2) Recruiter / CompanyAdmin xem ứng viên nộp vào job thuộc công ty mình
    @Query("""
        select distinct a from Application a
          join fetch a.status s
          join fetch a.user u
          left join fetch u.userSkills us
          join a.job j
          join j.company c
          join c.companyAdmins ca
          join ca.user cau
        where a.id = :applicationId
          and cau.id = :actorUserId
    """)
    Optional<Application> findCandidateByIdForCompanyAdmin(@Param("applicationId") Long applicationId,
                                                           @Param("actorUserId") Long actorUserId);
}

