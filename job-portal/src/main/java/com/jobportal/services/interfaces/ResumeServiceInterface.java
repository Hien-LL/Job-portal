package com.jobportal.services.interfaces;

import com.jobportal.dtos.requests.creation.ResumeCreationRequest;
import com.jobportal.dtos.requests.updation.ResumeUpdationRequest;
import com.jobportal.dtos.resources.ResumeResource;
import java.util.List;

public interface ResumeServiceInterface {
    List<ResumeResource> getListById(Long userId, Boolean isDefault);
    ResumeResource getDetail(Long userId, Long resumeId);

    ResumeResource create(Long userId, ResumeCreationRequest request);
    ResumeResource update(Long userId, Long resumeId, ResumeUpdationRequest request);

    void delete(Long userId, Long resumeId);
}
