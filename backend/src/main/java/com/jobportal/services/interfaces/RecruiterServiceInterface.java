package com.jobportal.services.interfaces;

import com.jobportal.dtos.resources.ApplicationStatisticsResource;
import com.jobportal.dtos.resources.RecruiterOverviewResource;
import com.jobportal.dtos.resources.RecruiterRecentApplicationResource;
import com.jobportal.dtos.resources.RecruiterRecentJobResource;

import java.util.List;

public interface RecruiterServiceInterface {
    RecruiterOverviewResource getOverview(Long userId);
    List<RecruiterRecentJobResource> getRecentJobs(Long userId, int limit);
    List<RecruiterRecentApplicationResource> getRecentApplications(Long userId, int limit, String status);
    ApplicationStatisticsResource getApplicationStatistics(Long userId);

}

