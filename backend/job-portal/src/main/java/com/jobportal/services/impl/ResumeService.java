package com.jobportal.services.impl;

import com.jobportal.dtos.requests.ResumeCreationRequest;
import com.jobportal.dtos.requests.ResumeUpdationRequest;
import com.jobportal.dtos.resources.ResumeResource;
import com.jobportal.entities.*;
import com.jobportal.mappers.ResumeMapper;
import com.jobportal.repositories.ResumeRepository;
import com.jobportal.repositories.UserRepository;
import com.jobportal.services.interfaces.ResumeServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeService implements ResumeServiceInterface {
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final ResumeMapper resumeMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ResumeResource> getListById(Long userId) {
        if (!userRepository.existsById(userId)) throw new EntityNotFoundException("Người dùng không tồn tại");

        List<Resume> resumes = resumeRepository.findByUserIdOrderByIdDesc(userId);
        return resumeMapper.tResourceList(resumes);
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeResource getDetail(Long userId, Long resumeId) {
        Resume resume = resumeRepository.fetchDetailWithExperiences(resumeId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Resume không tồn tại"));
        // kích hoạt SUBSELECT cho 2 collection còn lại
        resume.getEducations().size();
        resume.getFiles().size();
        return ResumeResource.ofDetail(resume);
    }

    // ========== CREATE ==========
    @Override
    @Transactional
    public ResumeResource create(Long userId, ResumeCreationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));

        Resume resume = resumeMapper.tEntity(request);
        resume.setUser(user);

        if (resume.getEducations() != null) {
            resume.getEducations().forEach(e -> e.setResume(resume));
        }
        if (resume.getExperiences() != null) {
            resume.getExperiences().forEach(e -> e.setResume(resume));
        }

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            unsetDefault(userId);
            resume.setDefault(true);
        }

        resumeRepository.save(resume);
        return resumeMapper.tResource(resume);
    }

    // ========== UPDATE (replace children) ==========
    @Override
    @Transactional
    public ResumeResource update(Long userId, Long resumeId, ResumeUpdationRequest request) {
        Resume resume = resumeRepository.fetchDetailWithExperiences(resumeId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Resume không tồn tại"));

        resumeMapper.updateEntityFromRequest(request, resume);

        if (resume.getEducations() != null) {
            resume.getEducations().forEach(e -> e.setResume(resume));
        }
        if (resume.getExperiences() != null) {
            resume.getExperiences().forEach(e -> e.setResume(resume));
        }

        boolean setDefault = Boolean.TRUE.equals(request.getIsDefault());
        if (setDefault) unsetDefault(userId);

        return resumeMapper.tResource(resume);
    }

    // ===== helpers =====
    private void unsetDefault(Long userId) {
        resumeRepository.findFirstByUserIdAndIsDefaultTrue(userId)
                .ifPresent(old -> old.setDefault(false));
    }
}
