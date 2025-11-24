package com.jobportal.dtos.resources;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class AdminStatsResource {
    private Long totalUsers;
    private Long totalCompanies;
    private Long totalJobs;
    private Long totalApplications;

    private Map<String, Object> chartData;

}
