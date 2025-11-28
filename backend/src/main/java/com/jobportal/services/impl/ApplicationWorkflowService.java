package com.jobportal.services.impl;

import com.jobportal.commons.BaseService;
import com.jobportal.dtos.requests.creation.ApplicationUpdateStatusRequest;
import com.jobportal.dtos.resources.ApplicationStatusChangeResource;
import com.jobportal.dtos.resources.ApplicationStatusHistoryResource;
import com.jobportal.entities.Application;
import com.jobportal.entities.ApplicationStatus;
import com.jobportal.entities.ApplicationStatusHistory;
import com.jobportal.mappers.ApplicationStatusHistoryMapper;
import com.jobportal.repositories.ApplicationRepository;
import com.jobportal.repositories.ApplicationStatusHistoryRepository;
import com.jobportal.repositories.ApplicationStatusRepository;
import com.jobportal.repositories.CompanyAdminRepository;
import com.jobportal.services.interfaces.ApplicationWorkflowServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ApplicationWorkflowService extends BaseService implements ApplicationWorkflowServiceInterface {

    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusRepository statusRepository;
    private final ApplicationStatusHistoryRepository historyRepository;
    private final CompanyAdminRepository companyAdminRepository;
    private final ApplicationStatusHistoryMapper historyMapper;
    /**
     * Đổi trạng thái của 1 Application (đơn ứng tuyển)
     */
    @Override
    public ApplicationStatusChangeResource changeStatusOfApplication(
            Long actorUserId, Long applicationId, ApplicationUpdateStatusRequest request) {

        Application app = applicationRepository.findByIdWithJoins(applicationId)
                .orElseThrow(() -> new EntityNotFoundException("Application không tồn tại"));

        Long companyId = app.getJob().getCompany().getId();

        boolean allowed = companyAdminRepository.existsByCompany_IdAndUser_Id(companyId, actorUserId);
        if (!allowed) throw new SecurityException("Bạn không có quyền thay đổi thông tin này");

        String newCode = request.getNewStatusCode().trim().toUpperCase();
        ApplicationStatus newStatus = statusRepository.findByCode(newCode)
                .orElseThrow(() -> new EntityNotFoundException("Status không tồn tại: " + newCode));

        ApplicationStatus oldStatus = app.getStatus();
        if (oldStatus.getCode().equals(newStatus.getCode())) {
            // Không tạo history nếu không đổi
            return ApplicationStatusChangeResource.builder()
                    .applicationId(app.getId())
                    .oldStatusCode(oldStatus.getCode())
                    .oldStatusName(oldStatus.getName())
                    .newStatusCode(newStatus.getCode())
                    .newStatusName(newStatus.getName())
                    .note("(no-op)")
                    .changedAt(LocalDateTime.now())
                    .build();
        }

        app.setStatus(newStatus); // dirty checking

        ApplicationStatusHistory hist = ApplicationStatusHistory.builder()
                .application(app)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .note(request.getNote())
                .build();
        historyRepository.save(hist);

        return ApplicationStatusChangeResource.builder()
                .applicationId(app.getId())
                .oldStatusCode(oldStatus.getCode())
                .oldStatusName(oldStatus.getName())
                .newStatusCode(newStatus.getCode())
                .newStatusName(newStatus.getName())
                .note(request.getNote())
                .changedAt(hist.getChangedAt()) // giả sử entity set ở @PrePersist
                .build();
    }

    /**
     * Lấy timeline lịch sử thay đổi trạng thái của Application
     */
    @Override
    public List<ApplicationStatusHistoryResource> timelineByApplication(Long actorUserId, Long applicationId) {
        // Lấy application kèm job + company để check quyền
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new EntityNotFoundException("Application không tồn tại"));

        Long ownerId = app.getUser().getId();
        Long companyId = app.getJob().getCompany().getId();

        boolean isCandidate = ownerId.equals(actorUserId);
        boolean isCompanyAdmin = companyAdminRepository.existsByCompany_IdAndUser_Id(actorUserId, companyId);

        if (!isCandidate && !isCompanyAdmin) {
            throw new SecurityException("Bạn không có quyền xem timeline này");
        }

        // Lấy timeline
        List<ApplicationStatusHistory> histories =
                historyRepository.findByApplication_IdOrderByChangedAtDesc(applicationId);

        // Map ra DTO
        return historyMapper.tResourceList(histories);
    }
}
