package com.jobportal.services.interfaces;

import com.jobportal.dtos.requests.ResumeCreationRequest;
import com.jobportal.dtos.requests.ResumeUpdationRequest;
import com.jobportal.dtos.resources.ResumeResource;
import java.util.List;

public interface ResumeServiceInterface {
    List<ResumeResource> getListById(Long userId);
    ResumeResource getDetail(Long userId, Long resumeId);

    ResumeResource create(Long userId, ResumeCreationRequest request);
    ResumeResource update(Long userId, Long resumeId, ResumeUpdationRequest request);
}
