package com.jobportal.services.impl;

import com.jobportal.dtos.requests.creation.ApplicationCreationRequest;
import com.jobportal.dtos.resources.ApplicationDetailResource;
import com.jobportal.dtos.resources.ApplicationListItemForCompanyResource;
import com.jobportal.dtos.resources.ApplicationResource;
import com.jobportal.dtos.resources.CandidateResource;
import com.jobportal.entities.*;
import com.jobportal.mappers.*;
import com.jobportal.repositories.*;
import com.jobportal.services.interfaces.ApplicationServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApplicationService implements ApplicationServiceInterface {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusRepository applicationStatusRepository;
    private final ApplicationMapper applicationMapper;
    private final UserRepository userRepository;
    private final CompanyAdminRepository companyAdminRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeMapper resumeMapper;
    private final UserMapper userMapper;
    private final UserSkillMapper userSkillMapper;
    private final ApplicationStatusMapper applicationStatusMapper;

    @Override
    @Transactional // write
    public ApplicationResource createForJob(Long jobId, Long userId, ApplicationCreationRequest request) {
        if (applicationRepository.existsByUser_IdAndJob_Id(userId, jobId)) {
            throw new IllegalStateException("Bạn đã ứng tuyển vào công việc này");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new EntityNotFoundException("Job không tồn tại"));
        ApplicationStatus status = applicationStatusRepository.findByCode("APPLIED")
                .orElseThrow(() -> new EntityNotFoundException("Status không tồn tại"));

        Application app = applicationMapper.tEntity(request);
        app.setUser(user);
        app.setJob(job);
        app.setStatus(status);

        Application saved = applicationRepository.save(app);
        return applicationMapper.tResource(saved);
    }

    @Override
    public Page<ApplicationResource> getApplicationsByUserId(Long userId, String status, Pageable pageable) {
        String statusCode = normalizeStatusCode(status);
        Page<Application> page = (statusCode == null)
                ? applicationRepository.findAllByUser_Id(userId, pageable)
                : applicationRepository.findAllByUserIdAndStatus(userId, statusCode, pageable);
        return applicationMapper.tResourcePage(page);
    }

    private String normalizeStatusCode(String raw) {
        if (raw == null || raw.isBlank()) return null;
        return raw.trim().toUpperCase(); // FE gửi code: APPLIED/REVIEWING/INTERVIEW/OFFER/REJECTED
    }

    @Override
    public Page<ApplicationListItemForCompanyResource> getApplicationsForMyCompanyJob(
            Long actorUserId, Long companyId, Long jobId, String status, Pageable pageable) {

        // Quyền: user phải là admin của company
        if (!companyAdminRepository.existsByCompany_IdAndUser_Id(actorUserId, companyId)) {
            throw new SecurityException("Bạn không có quyền truy cập ứng viên của công ty này");
        }

        // Tồn tại & thuộc về company: tránh query nhầm job
        jobRepository.findById(jobId)
                .filter(j -> j.getCompany() != null && j.getCompany().getId().equals(companyId))
                .orElseThrow(() -> new EntityNotFoundException("Job không thuộc công ty hoặc không tồn tại"));

        String statusCode = (status == null || status.isBlank()) ? null : status.trim().toUpperCase();

        Page<Application> page = applicationRepository
                .findAllForCompanyJob(companyId, jobId, statusCode, pageable);

        return applicationMapper.tResourceListItemPage(page);
    }

    @Override
    public ApplicationDetailResource getDetailForActor(Long applicationId, Long actorUserId) {
        Application app = applicationRepository.findDetailById(applicationId)
                .orElseThrow(() -> new EntityNotFoundException("Application không tồn tại"));

        Long ownerId   = app.getUser().getId();
        Long companyId = app.getJob().getCompany().getId();

        // Quyền: là chủ đơn, hoặc admin của company
        boolean allowed = ownerId.equals(actorUserId) ||
                companyAdminRepository.existsByCompany_IdAndUser_Id(actorUserId, companyId);

        if (!allowed) throw new SecurityException("Bạn không có quyền xem đơn này");

        // Map application
        ApplicationDetailResource dto = applicationMapper.toDetail(app);

        // Load resume (scalar FK)
        Resume resume = resumeRepository.findById(app.getResumeId())
                .orElseThrow(() -> new EntityNotFoundException("Resume không tồn tại"));
        dto.setResume(resumeMapper.tResource(resume));

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public CandidateResource getCandidateInfomations(Long applicationId, Long actorUserId) {
        Application application = applicationRepository
                .findCandidateByIdForOwner(applicationId, actorUserId) // case 1: owner
                .or(() -> applicationRepository.findCandidateByIdForCompanyAdmin(applicationId, actorUserId)) // case 2: admin
                .orElseThrow(() -> new EntityNotFoundException("Application không tồn tại hoặc bạn không có quyền"));

        User user = application.getUser();
        var builder = userMapper.tCandidateResource(user).toBuilder();

        if (user.getUserSkills() != null && !user.getUserSkills().isEmpty()) {
            builder.skills(userSkillMapper.tResourceList(user.getUserSkills()));
        }

        Resume resume = resumeRepository.findById(application.getResumeId())
                .orElseThrow(() -> new EntityNotFoundException("Resume không tồn tại"));
        builder.resume(resumeMapper.tResource(resume));

        ApplicationStatus status = application.getStatus();
        builder.status(applicationStatusMapper.tResource(status));
        builder.coverLetter(application.getCoverLetter());
        builder.appliedAt(application.getAppliedAt());
        return builder.build();
    }

    @Override
    public boolean existsByJobIdAndUserId(Long jobId, Long userId) {
        return applicationRepository.existsByUser_IdAndJob_Id(userId, jobId);
    }
}
