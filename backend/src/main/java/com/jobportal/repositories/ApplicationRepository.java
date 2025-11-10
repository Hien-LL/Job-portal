package com.jobportal.repositories;

import com.jobportal.entities.Application;
import com.jobportal.repositories.views.ApplicationStatsView;
import com.jobportal.repositories.views.RecruiterRecentApplicationView;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long>, JpaSpecificationExecutor<Application> {

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

    @Query("""
           select count(a)
           from Application a
           where a.job.company.id = :companyId
           """)
    int countAllByCompanyId(@Param("companyId") Long companyId);

    // Đếm theo mã status (code), VD: "PENDING", "ACCEPTED", "REJECTED"
    @Query("""
           select count(a)
           from Application a
           where a.job.company.id = :companyId
             and a.status.code = :code
           """)
    int countByCompanyAndStatusCode(@Param("companyId") Long companyId,
                                    @Param("code") String code);

    @Query("""
       select count(a)
       from Application a
       where a.job.company.id = :companyId
         and a.appliedAt >= :start
         and a.appliedAt <  :end
       """)
    int countNewInRange(
            @Param("companyId") Long companyId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );


    @Query("""
        select 
            a.id as id,
            j.title as jobTitle,
            u.name as candidateName,
            a.appliedAt as createdAt,
            s.code as statusCode
        from Application a
        join a.job j
        join a.user u
        join a.status s
        where j.company.id = :companyId
          and (:statusCode is null or lower(s.code) = lower(:statusCode))
        order by a.appliedAt desc
    """)
    List<RecruiterRecentApplicationView> findRecentApplications(
            @Param("companyId") Long companyId,
            @Param("statusCode") String statusCode,
            Pageable pageable
    );

    @Query("""
        select 
            count(a) as total,
            sum(case when lower(s.code) = 'pending'  then 1 else 0 end) as pending,
            sum(case when lower(s.code) = 'accepted' then 1 else 0 end) as accepted,
            sum(case when lower(s.code) = 'rejected' then 1 else 0 end) as rejected,
            sum(case when lower(s.code) = 'viewed'   then 1 else 0 end) as viewed
        from Application a
        join a.job j
        join a.status s
        where j.company.id = :companyId
    """)
    ApplicationStatsView aggregateStatsByCompany(@Param("companyId") Long companyId);
}

