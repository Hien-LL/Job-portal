package com.jobportal.services.interfaces;

import com.jobportal.dtos.resources.ResumeFileResource;
import org.springframework.web.multipart.MultipartFile;

public interface ResumeFileServiceInterface {
    ResumeFileResource upload(Long userId, Long resumeId, MultipartFile file, String fileType);
    void deleteFile(Long userId, Long fileId);
}
