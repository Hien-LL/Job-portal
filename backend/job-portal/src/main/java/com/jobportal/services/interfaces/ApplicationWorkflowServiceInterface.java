package com.jobportal.services.interfaces;

import com.jobportal.dtos.requests.ApplicationUpdateStatusRequest;
import com.jobportal.dtos.resources.ApplicationStatusChangeResource;
import com.jobportal.dtos.resources.ApplicationStatusHistoryResource;

import java.util.List;

public interface ApplicationWorkflowServiceInterface {
    ApplicationStatusChangeResource changeStatusOfApplication(Long actorUserId, Long jobId, ApplicationUpdateStatusRequest request);
    List<ApplicationStatusHistoryResource> timelineByApplication(Long userId,Long applicationId);
}
