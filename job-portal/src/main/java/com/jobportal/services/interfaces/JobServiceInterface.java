package com.jobportal.services.interfaces;

import com.jobportal.dtos.requests.creation.JobCreationRequest;
import com.jobportal.dtos.requests.updation.JobUpdationRequest;
import com.jobportal.dtos.resources.JobResource;
import com.jobportal.entities.Job;
import jakarta.validation.constraints.Positive;
import org.springframework.data.domain.Page;

import java.util.Map;

public interface JobServiceInterface {
    JobResource createJobForMyCompany(Long userId, JobCreationRequest request);
    JobResource getJobDetailBySlug(String slug);
    JobResource updateJobForMyCompany(Long userId, Long jobId, JobUpdationRequest request);
    Page<Job> paginationJob(Map<String, String[]> params, boolean includeAll);
    void deleteJobForMyCompany(Long userId,Long jobId);
    Page<Job> getJobsByCompanyId(Long companyId, Map<String, String[]> params);
    JobResource getJobForMyCompany(Long userId, @Positive(message = "id phải lớn hơn 0") Long jobId);
    Page<Job> paginationJobForMyCompany(Long userId, Map<String, String[]> params);
}
