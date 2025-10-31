package com.jobportal.services.impl;

import com.jobportal.dtos.requests.creation.ResumeCreationRequest;
import com.jobportal.dtos.requests.updation.ResumeUpdationRequest;
import com.jobportal.dtos.resources.ResumeResource;
import com.jobportal.entities.*;
import com.jobportal.mappers.ResumeMapper;
import com.jobportal.repositories.ResumeFileRepository;
import com.jobportal.repositories.ResumeRepository;
import com.jobportal.repositories.UserRepository;
import com.jobportal.services.interfaces.ResumeFileServiceInterface;
import com.jobportal.services.interfaces.ResumeServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResumeService implements ResumeServiceInterface {
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final ResumeMapper resumeMapper;
    private final ResumeFileServiceInterface resumeFileService;
    private final ResumeFileRepository resumeFileRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ResumeResource> getListById(Long userId, Boolean isDefault) {
        if (!userRepository.existsById(userId))
            throw new EntityNotFoundException("Người dùng không tồn tại");

        List<Resume> resumes;
        if (isDefault != null) {
            resumes = resumeRepository.findByUserIdAndIsDefaultOrderByIdDesc(userId, isDefault);
        } else {
            resumes = resumeRepository.findByUserIdOrderByIdDesc(userId);
        }

        return resumeMapper.tResourceList(resumes);
    }


    @Override
    @Transactional(readOnly = true)
    public ResumeResource getDetail(Long userId, Long resumeId) {
        Resume resume = resumeRepository.fetchDetailWithExperiences(resumeId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Resume không tồn tại"));
        return resumeMapper.tResource(resume);
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

        // map field đơn
        resumeMapper.updateEntityFromRequest(request, resume);

        // =========== EXPERIENCES ===========
        if (request.getExperiences() != null) {
            // map hiện có theo id
            Map<Long, ResumeExperience> existById = resume.getExperiences().stream()
                    .filter(x -> x.getId() != null)
                    .collect(Collectors.toMap(ResumeExperience::getId, Function.identity()));

            // id có trong request để giữ lại
            Set<Long> incomingIds = new HashSet<>();

            for (var up : request.getExperiences()) {
                Long key = up.getId(); // DTO class @Data => getId()
                if (key != null && existById.containsKey(key)) {
                    // update in-place
                    ResumeExperience e = existById.get(key);
                    e.setCompany(up.getCompany());
                    e.setPosition(up.getPosition());
                    e.setCurrent(up.isCurrent());
                    e.setDescription(up.getDescription());
                    e.setStartDate(up.getStartDate());
                    e.setEndDate(up.getEndDate());
                    incomingIds.add(key);
                } else {
                    // new
                    ResumeExperience neo = new ResumeExperience();
                    neo.setCompany(up.getCompany());
                    neo.setPosition(up.getPosition());
                    neo.setCurrent(up.isCurrent());
                    neo.setDescription(up.getDescription());
                    neo.setStartDate(up.getStartDate());
                    neo.setEndDate(up.getEndDate());
                    neo.setResume(resume);
                    resume.getExperiences().add(neo);
                }
            }

            // remove thừa (không có trong request)
            resume.getExperiences().removeIf(e -> e.getId() != null && !incomingIds.contains(e.getId()));
        }

        // =========== EDUCATIONS ===========
        if (request.getEducations() != null) {
            Map<Long, ResumeEducation> existById = resume.getEducations().stream()
                    .filter(x -> x.getId() != null)
                    .collect(Collectors.toMap(ResumeEducation::getId, Function.identity()));

            Set<Long> incomingIds = new HashSet<>();

            for (var up : request.getEducations()) {
                Long key = up.getId();
                if (key != null && existById.containsKey(key)) {
                    ResumeEducation e = existById.get(key);
                    e.setDegree(up.getDegree());
                    e.setMajor(up.getMajor());
                    e.setSchool(up.getSchool());
                    e.setStartDate(up.getStartDate());
                    e.setEndDate(up.getEndDate());
                    incomingIds.add(key);
                } else {
                    ResumeEducation neo = new ResumeEducation();
                    neo.setDegree(up.getDegree());
                    neo.setMajor(up.getMajor());
                    neo.setSchool(up.getSchool());
                    neo.setStartDate(up.getStartDate());
                    neo.setEndDate(up.getEndDate());
                    neo.setResume(resume);
                    resume.getEducations().add(neo);
                }
            }

            resume.getEducations().removeIf(e -> e.getId() != null && !incomingIds.contains(e.getId()));
        }

        // default flag
        if (request.isDefault()) {
            unsetDefault(userId);
            resume.setDefault(true);
        }

        // flush để gán id cho NEW
        Resume saved = resumeRepository.saveAndFlush(resume);
        return resumeMapper.tResource(saved);
    }

    @Override
    public void delete(Long userId, Long resumeId) {
        if (!resumeRepository.existsByIdAndUserId(resumeId, userId))
            throw new EntityNotFoundException("Resume không tồn tại");
        // xoá file liên quan
        List<ResumeFile> files = resumeFileRepository.findByResumeId(resumeId);
        for (ResumeFile f : files) {
            resumeFileService.deleteFile(userId, f.getId());
        }
        // xoá resume
        resumeRepository.deleteById(resumeId);
    }


    // ===== helpers =====
    private void unsetDefault(Long userId) {
        resumeRepository.findFirstByUserIdAndIsDefaultTrue(userId)
                .ifPresent(old -> old.setDefault(false));
    }
}
