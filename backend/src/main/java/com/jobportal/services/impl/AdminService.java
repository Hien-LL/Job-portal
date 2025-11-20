package com.jobportal.services.impl;

import com.jobportal.dtos.resources.AdminStatsResource;
import com.jobportal.entities.Job;
import com.jobportal.repositories.AdminRepository;
import com.jobportal.repositories.JobRepository;
import com.jobportal.repositories.SavedJobRepository;
import com.jobportal.services.interfaces.AdminServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService implements AdminServiceInterface {
    private  final AdminRepository adminRepository;
    private final JobRepository jobRepository;
    private final SavedJobRepository savedJobRepository;

    public AdminStatsResource getStats() {
        Object[] totals = (Object[]) adminRepository.getTotals();

        // Convert totals
        Long totalUsers = ((Number) totals[0]).longValue();
        Long totalCompanies = ((Number) totals[1]).longValue();
        Long totalJobs = ((Number) totals[2]).longValue();
        Long totalApplications = ((Number) totals[3]).longValue();

        // Convert chart lists → Map<String, Long>
        Map<String, Long> userChart = adminRepository.getUserChart()
                .stream()
                .collect(Collectors.toMap(
                        r -> r[0].toString(),
                        r -> ((Number) r[1]).longValue(),
                        (a, b) -> a, TreeMap::new
                ));

        Map<String, Long> jobChart = adminRepository.getJobChart()
                .stream()
                .collect(Collectors.toMap(
                        r -> r[0].toString(),
                        r -> ((Number) r[1]).longValue(),
                        (a, b) -> a, TreeMap::new
                ));

        return AdminStatsResource.builder()
                .totalUsers(totalUsers)
                .totalCompanies(totalCompanies)
                .totalJobs(totalJobs)
                .totalApplications(totalApplications)
                .userChart(userChart)
                .jobChart(jobChart)
                .build();
    }

    @Transactional
    @Override
    public void deleteJob(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // 1) Xoá saved_jobs trước để tránh FK lỗi
        savedJobRepository.deleteByJobId(id);

        // 2) Xoá job → cascade xoá Application + histories
        jobRepository.delete(job);
    }
}
