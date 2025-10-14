package com.jobportal.services.interfaces;

import com.jobportal.dtos.requests.JobCreationRequest;
import com.jobportal.dtos.requests.JobUpdationRequest;
import com.jobportal.dtos.resources.JobResource;
import com.jobportal.entities.Job;
import org.springframework.data.domain.Page;

import java.util.Map;

public interface JobServiceInterface {
    JobResource createJobForMyCompany(Long userId, Long companyAdminId, JobCreationRequest request);
    JobResource getJobDetailBySlug(String slug);
    Page<Job> paginationJob(Map<String, String[]> params);
    JobResource updateJobForMyCompany(Long userId, Long companyId, Long jobId, JobUpdationRequest request);
    void deleteJobForMyCompany(Long userId, Long companyId, Long jobId);
}
