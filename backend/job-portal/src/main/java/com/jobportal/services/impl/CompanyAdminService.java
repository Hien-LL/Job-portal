package com.jobportal.services.impl;

import com.jobportal.entities.Company;
import com.jobportal.entities.CompanyAdmin;
import com.jobportal.entities.CompanyAdminId;
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
        CompanyAdminId id = new CompanyAdminId(userId, companyId);

        // 1) Đang managed trong persistence context?
        CompanyAdmin managed = em.find(CompanyAdmin.class, id);
        if (managed != null) {
            return;
        }

        // 2) Trong DB đã có chưa?
        companyAdminRepository.findById(id).orElseGet(() -> {
            // 3) Tạo mới 1 lần duy nhất
            User user = em.getReference(User.class, userId);
            Company company = em.getReference(Company.class, companyId);

            CompanyAdmin ca = CompanyAdmin.of(user, company);

            // ❗ Không add vào cả hai Set nữa để tránh nhân đôi cascade trong cùng session
            // Nếu cần đồng bộ 2 chiều, có thể add một bên sau khi save.
            CompanyAdmin saved = companyAdminRepository.save(ca);

            // (tuỳ chọn) đồng bộ 1 chiều để tránh duplicate trong bộ nhớ:
            user.getCompanyAdmins().add(saved);
            // company.getCompanyAdmins().add(saved); // thường KHÔNG cần add cả hai phía

            return saved;
        });
    }
}
