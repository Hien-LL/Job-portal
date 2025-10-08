// com/jobportal/services/impl/ResumeService.java
package com.jobportal.services.impl;

import com.jobportal.dtos.requests.ResumeReq;
import com.jobportal.dtos.resources.ResumeResource;
import com.jobportal.entities.*;
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

    @Override
    @Transactional(readOnly = true)
    public List<ResumeResource> getListById(Long userId) {
        if (!userRepository.existsById(userId)) throw new EntityNotFoundException("Người dùng không tồn tại");
        return resumeRepository.findByUserIdOrderByIdDesc(userId)
                .stream().map(ResumeResource::ofSummary).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeResource getDetail(Long userId, Long resumeId) {
        Resume r = resumeRepository.fetchDetailWithExperiences(resumeId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Resume không tồn tại"));
        // kích hoạt SUBSELECT cho 2 collection còn lại
        r.getEducations().size();
        r.getFiles().size();
        return ResumeResource.ofDetail(r);
    }

    // ========== CREATE ==========
    @Override
    @Transactional
    public ResumeResource create(Long userId, ResumeReq req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));

        Resume r = new Resume();
        r.setUser(user);
        applyDto(r, req);

        if (Boolean.TRUE.equals(req.getIsDefault())) {
            unsetDefault(userId);
            r.setDefault(true);
        }

        Resume saved = resumeRepository.save(r);
        // map detail (trong TX)
        return ResumeResource.ofDetail(saved);
    }

    // ========== UPDATE (replace children) ==========
    @Override
    @Transactional
    public ResumeResource update(Long userId, Long resumeId, ResumeReq req) {
        Resume r = resumeRepository.fetchDetailWithExperiences(resumeId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Resume không tồn tại"));

        // default flag
        boolean setDefault = Boolean.TRUE.equals(req.getIsDefault());
        if (setDefault) unsetDefault(userId);

        // replace fields
        r.setTitle(req.getTitle());
        r.setSummary(req.getSummary());
        r.setDefault(setDefault);

        // replace children
        r.getExperiences().clear();
        r.getEducations().clear();
        r.getFiles().clear();
        attachChildren(r, req);

        // kích hoạt subselect load lại để trả detail ổn định (không bắt buộc)
        r.getEducations().size();
        r.getFiles().size();

        return ResumeResource.ofDetail(r);
    }

    // ===== helpers =====
    private void unsetDefault(Long userId) {
        resumeRepository.findFirstByUserIdAndIsDefaultTrue(userId)
                .ifPresent(old -> old.setDefault(false));
    }

    private void applyDto(Resume r, ResumeReq req) {
        r.setTitle(req.getTitle());
        r.setSummary(req.getSummary());
        r.setDefault(Boolean.TRUE.equals(req.getIsDefault()));
        attachChildren(r, req);
    }

    private void attachChildren(Resume r, ResumeReq req) {
        if (req.getExperiences() != null) {
            req.getExperiences().forEach(e -> {
                ResumeExperience x = new ResumeExperience();
                x.setResume(r);
                x.setCompany(e.getCompany());
                x.setPosition(e.getPosition());
                x.setStartDate(e.getStartDate());
                x.setEndDate(e.getEndDate());
                x.setCurrent(Boolean.TRUE.equals(e.getCurrent()));
                x.setDescription(e.getDescription());
                r.getExperiences().add(x);
            });
        }
        if (req.getEducations() != null) {
            req.getEducations().forEach(e -> {
                ResumeEducation x = new ResumeEducation();
                x.setResume(r);
                x.setSchool(e.getSchool());
                x.setDegree(e.getDegree());
                x.setMajor(e.getMajor());
                x.setStartDate(e.getStartDate());
                x.setEndDate(e.getEndDate());
                r.getEducations().add(x);
            });
        }
        if (req.getFiles() != null) {
            req.getFiles().forEach(f -> {
                ResumeFile x = new ResumeFile();
                x.setResume(r);
                x.setFileUrl(f.getFileUrl());
                x.setFileType(f.getFileType());
                r.getFiles().add(x);
            });
        }
    }
}
