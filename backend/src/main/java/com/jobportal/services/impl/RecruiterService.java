package com.jobportal.services.impl;

import com.jobportal.dtos.resources.ApplicationStatisticsResource;
import com.jobportal.dtos.resources.RecruiterOverviewResource;
import com.jobportal.dtos.resources.RecruiterRecentApplicationResource;
import com.jobportal.dtos.resources.RecruiterRecentJobResource;
import com.jobportal.entities.Company;
import com.jobportal.repositories.ApplicationRepository;
import com.jobportal.repositories.CompanyAdminRepository;
import com.jobportal.repositories.FollowCompanyRepository;
import com.jobportal.repositories.JobRepository;
import com.jobportal.repositories.views.RecruiterRecentApplicationView;
import com.jobportal.repositories.views.RecruiterRecentJobView;
import com.jobportal.services.interfaces.RecruiterServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import com.jobportal.repositories.views.ApplicationStatsView;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecruiterService implements RecruiterServiceInterface {

    private final CompanyAdminRepository adminRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final FollowCompanyRepository followRepository;

    @Override
    public RecruiterOverviewResource getOverview(Long userId) {

        // Lấy công ty của recruiter
        Company company = adminRepository.findCompanyByAdminUserId(userId)
                .orElseThrow(() -> new SecurityException("Không có quyền xem tổng quan"));

        Long companyId = company.getId();

        int totalJobs = jobRepository.countAllByCompanyId(companyId);
        int activeJobs = jobRepository.countActiveByCompanyId(companyId);

        int totalApplications = applicationRepository.countAllByCompanyId(companyId);
        int pending = applicationRepository.countByCompanyAndStatusCode(companyId, "PENDING");
        int accepted = applicationRepository.countByCompanyAndStatusCode(companyId, "ACCEPTED");
        int rejected = applicationRepository.countByCompanyAndStatusCode(companyId, "REJECTED");

        // “New today” (UTC)
        var Z = java.time.ZoneOffset.UTC;
        var today = java.time.LocalDate.now(Z);
        var startInstant = today.atStartOfDay(Z).toInstant();
        var endInstant   = today.plusDays(1).atStartOfDay(Z).toInstant();

        var start = java.time.LocalDateTime.ofInstant(startInstant, Z);
        var end   = java.time.LocalDateTime.ofInstant(endInstant, Z);
        int newApplications = applicationRepository.countNewInRange(companyId, start, end);

        int followers = followRepository.countFollowers(companyId);

        return RecruiterOverviewResource.builder()
                .totalJobs(totalJobs)
                .activeJobs(activeJobs)
                .newApplications(newApplications)
                .totalApplications(totalApplications)
                .pendingApplications(pending)
                .acceptedApplications(accepted)
                .rejectedApplications(rejected)
                .companyFollowers(followers)
                .build();
    }

    private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter DMY = DateTimeFormatter.ofPattern("dd/MM/yyyy").withZone(VN_ZONE);

    @Override
    public List<RecruiterRecentJobResource> getRecentJobs(Long userId, int limit) {
        Company company = adminRepository.findCompanyByAdminUserId(userId)
                .orElseThrow(() -> new SecurityException("Không có quyền"));

        List<RecruiterRecentJobView> rows = jobRepository.findRecentJobsWithApplicantCount(
                company.getId(),
                PageRequest.of(0, Math.max(1, limit))
        );

        return rows.stream().map(v -> RecruiterRecentJobResource.builder()
                        .id(v.getId())
                        .title(v.getTitle())
                        .postedDate(v.getCreatedAt() != null ? DMY.format(v.getCreatedAt()) : null)
                        .status(Boolean.TRUE.equals(v.getPublished()) ? "published" : "draft")
                        .applicantsCount(v.getApplicantsCount() == null ? 0 : v.getApplicantsCount().intValue())
                        .build())
                .toList();
    }

    @Override
    public List<RecruiterRecentApplicationResource> getRecentApplications(Long userId, int limit, String status) {
        Company company = adminRepository.findCompanyByAdminUserId(userId)
                .orElseThrow(() -> new SecurityException("Không có quyền"));

        // status=null hoặc ALL => bỏ filter
        String code = (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status))
                ? null
                : status.toLowerCase();

        List<RecruiterRecentApplicationView> rows = applicationRepository.findRecentApplications(
                company.getId(),
                code,
                PageRequest.of(0, Math.max(1, limit))
        );

        return rows.stream().map(v -> RecruiterRecentApplicationResource.builder()
                        .id(v.getId())
                        .jobTitle(v.getJobTitle())
                        .candidateName(v.getCandidateName())
                        .appliedDate(v.getCreatedAt() != null ? DMY.format(v.getCreatedAt()) : null)
                        .status(v.getStatusCode() != null ? v.getStatusCode().toLowerCase() : null)
                        .build())
                .toList();
    }

    @Override
    public ApplicationStatisticsResource getApplicationStatistics(Long userId) {
        Company company = adminRepository.findCompanyByAdminUserId(userId)
                .orElseThrow(() -> new SecurityException("Không có quyền"));

        ApplicationStatsView v = applicationRepository.aggregateStatsByCompany(company.getId());

        return ApplicationStatisticsResource.builder()
                .total(safe(v.getTotal()))
                .pending(safe(v.getPending()))
                .accepted(safe(v.getAccepted()))
                .rejected(safe(v.getRejected()))
                .viewed(safe(v.getViewed()))
                .build();
    }

    private int safe(Long n) { return n == null ? 0 : n.intValue(); }
}

