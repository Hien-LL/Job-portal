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
    private static final String[] WEEK_DAYS = {"T2","T3","T4","T5","T6","T7","CN"};

    public AdminStatsResource getStats() {
        Object[] totals = (Object[]) adminRepository.getTotals();

        Long totalUsers = ((Number) totals[0]).longValue();
        Long totalCompanies = ((Number) totals[1]).longValue();
        Long totalJobs = ((Number) totals[2]).longValue();
        Long totalApplications = ((Number) totals[3]).longValue();

        // --- Base labels ---
        String[] labels = {"T2","T3","T4","T5","T6","T7","CN"};
        Map<String, Long> userWeek = buildWeekTemplate();
        Map<String, Long> jobWeek = buildWeekTemplate();

        // Fill userWeek
        adminRepository.getUserChart().forEach(r -> {
            String dow = mapDayOfWeek(((Number) r[0]).intValue());
            userWeek.put(dow, ((Number) r[1]).longValue());
        });

        // Fill jobWeek
        adminRepository.getJobChart().forEach(r -> {
            String dow = mapDayOfWeek(((Number) r[0]).intValue());
            jobWeek.put(dow, ((Number) r[1]).longValue());
        });

        // Convert map → array (đúng thứ tự label)
        long[] userArr = new long[7];
        long[] jobArr = new long[7];
        for (int i = 0; i < 7; i++) {
            userArr[i] = userWeek.get(labels[i]);
            jobArr[i] = jobWeek.get(labels[i]);
        }

        // BUILD chartData đúng chuẩn FE
        Map<String, Object> chartData = Map.of(
                "labels", labels,
                "users", userArr,
                "jobs", jobArr
        );

        return AdminStatsResource.builder()
                .totalUsers(totalUsers)
                .totalCompanies(totalCompanies)
                .totalJobs(totalJobs)
                .totalApplications(totalApplications)
                .chartData(chartData)
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

    private Map<String, Long> buildWeekTemplate() {
        Map<String, Long> map = new TreeMap<>();
        for (String d : WEEK_DAYS) map.put(d, 0L);
        return map;
    }

    private String mapDayOfWeek(int day) {
        return switch (day) {
            case 2 -> "T2";
            case 3 -> "T3";
            case 4 -> "T4";
            case 5 -> "T5";
            case 6 -> "T6";
            case 7 -> "T7";
            case 1 -> "CN";
            default -> "T2";
        };
    }

}
