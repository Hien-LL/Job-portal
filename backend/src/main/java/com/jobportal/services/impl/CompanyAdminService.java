package com.jobportal.services.impl;

import com.jobportal.entities.Company;
import com.jobportal.entities.CompanyAdmin;
import com.jobportal.entities.Job;
import com.jobportal.entities.User;
import com.jobportal.repositories.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class CompanyAdminService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final CompanyAdminRepository companyAdminRepository;
    private final FollowCompanyRepository followCompanyRepository;
    private final JobRepository jobRepository;

    @PersistenceContext
    private EntityManager em;

    /**
     * Liên kết user - company an toàn:
     * 1) Ưu tiên lấy entity đang managed trong session (em.find)
     * 2) Nếu DB đã có -> trả về entity có sẵn
     * 3) Nếu chưa có -> tạo mới đúng 1 lần
     */
    @Transactional
    public void linkUserToCompany(Long userId, Long companyId) {
        if (companyAdminRepository.existsByUser_Id(userId)) {
            throw new IllegalStateException("User này đã là admin của 1 công ty khác");
        }

        User user = userRepository.findById(userId).orElseThrow();
        Company company = companyRepository.findById(companyId).orElseThrow();

        CompanyAdmin ca = CompanyAdmin.builder()
                .user(user)
                .company(company)
                .build();

        companyAdminRepository.save(ca);
    }

    @Transactional
    public void deleteCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // 1) Xoá follow_companies trước (tránh FK)
        followCompanyRepository.deleteByCompanyId(id);

        // 2) Lấy tất cả jobs của company rồi xoá
        //    -> tự cascade xoá Application + ApplicationStatusHistory
        List<Job> jobs = jobRepository.findByCompanyId(id);
        jobRepository.deleteAll(jobs);

        // 3) Xoá company
        //    -> tự cascade xoá company_admins (do cascade = ALL + orphanRemoval)
        companyRepository.delete(company);
    }
}
