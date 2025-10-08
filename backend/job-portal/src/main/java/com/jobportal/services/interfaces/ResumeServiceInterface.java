// com/jobportal/services/interfaces/ResumeServiceInterface.java
package com.jobportal.services.interfaces;

import com.jobportal.dtos.requests.ResumeReq;
import com.jobportal.dtos.resources.ResumeResource;

import java.util.List;

public interface ResumeServiceInterface {
    List<ResumeResource> getListById(Long userId);
    ResumeResource getDetail(Long userId, Long resumeId);

    // thêm:
    ResumeResource create(Long userId, ResumeReq req);
    ResumeResource update(Long userId, Long resumeId, ResumeReq req);
}
