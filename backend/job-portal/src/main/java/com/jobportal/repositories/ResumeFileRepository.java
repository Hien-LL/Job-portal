package com.jobportal.repositories;

import com.jobportal.entities.ResumeFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeFileRepository extends JpaRepository<ResumeFile, Long> {
    List<ResumeFile> findByResumeId(Long resumeId);
}
