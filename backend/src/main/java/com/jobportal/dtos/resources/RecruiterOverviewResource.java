package com.jobportal.dtos.resources;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class RecruiterOverviewResource {
    private int totalJobs;
    private int activeJobs;
    private int newApplications;
    private int totalApplications;
    private int pendingApplications;
    private int acceptedApplications;
    private int rejectedApplications;
    private int companyFollowers;
}
