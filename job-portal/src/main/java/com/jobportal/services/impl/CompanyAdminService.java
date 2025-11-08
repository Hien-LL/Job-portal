package com.jobportal.services.impl;

import com.jobportal.entities.Company;
import com.jobportal.entities.CompanyAdmin;
import com.jobportal.entities.User;
import com.jobportal.repositories.CompanyAdminRepository;
import com.jobportal.repositories.CompanyRepository;
import com.jobportal.repositories.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class CompanyAdminService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final CompanyAdminRepository companyAdminRepository;

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
}
