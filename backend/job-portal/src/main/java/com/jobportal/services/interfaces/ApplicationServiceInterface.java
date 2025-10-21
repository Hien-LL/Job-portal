package com.jobportal.services.interfaces;

import com.jobportal.dtos.requests.creation.ApplicationCreationRequest;
import com.jobportal.dtos.resources.ApplicationDetailResource;
import com.jobportal.dtos.resources.ApplicationListItemForCompanyResource;
import com.jobportal.dtos.resources.ApplicationResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ApplicationServiceInterface {
    ApplicationResource createForJob(Long jobId, Long userId, ApplicationCreationRequest request);
    Page<ApplicationResource> getApplicationsByUserId(Long userId, String status, Pageable pageable);
    Page<ApplicationListItemForCompanyResource> getApplicationsForMyCompanyJob(
            Long actorUserId, Long companyId, Long jobId, String status, Pageable pageable);
    ApplicationDetailResource getDetailForActor(Long applicationId, Long actorUserId);
}
