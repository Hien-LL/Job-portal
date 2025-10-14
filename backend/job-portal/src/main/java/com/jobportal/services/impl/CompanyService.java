package com.jobportal.services.impl;

import com.jobportal.commons.BaseService;
import com.jobportal.commons.Slugifier;
import com.jobportal.dtos.requests.CompanyCreationRequest;
import com.jobportal.dtos.requests.CompanyUpdationRequest;
import com.jobportal.entities.Company;
import com.jobportal.entities.CompanyAdminId;
import com.jobportal.entities.User;
import com.jobportal.mappers.CompanyMapper;
import com.jobportal.repositories.CompanyAdminRepository;
import com.jobportal.repositories.CompanyRepository;
import com.jobportal.repositories.UserRepository;
import com.jobportal.services.interfaces.CompanyServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyService extends BaseService implements CompanyServiceInterface {
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;
    private final CompanyAdminService companyAdminService;
    private final CompanyAdminRepository companyAdminRepository;

    @Override
    public Company createCompany(Long userId, CompanyCreationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy user"));

        Company company = companyMapper.tEntity(request);
        company.setCreatedBy(user);
        company.setVerified(false);
        company.setSlug(generateUniqueSlug(request.getName()));

        companyRepository.save(company);
        companyAdminService.linkUserToCompany(user.getId(), company.getId());

        return company;
    }

    @Override
    public List<Company> getListCompany(Long userId) {
        return companyRepository.findAllByMemberUserId(userId);
    }

    @Override
    public Company updateCompany(Long userId, Long companyId, CompanyUpdationRequest request) {
        if (!companyAdminRepository.existsById(new CompanyAdminId(userId, companyId))) {
            throw new SecurityException("Bạn không có quyền cập nhật công ty này");
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy company "));

        companyMapper.updateEntityFromRequest(request, company);

        if (request.getName() != null) {
            company.setSlug(generateUniqueSlug(request.getName()));
        }

        companyRepository.save(company);
        return company;
    }

    @Override
    public String uploadCompanyLogo(Long userId, Long companyId, MultipartFile file) {
        // 0) Validate đầu vào
        validateFile(file);

        // 0.1) Kiểm tra quyền: user phải thuộc company (bảng nối CompanyAdmin)
        if (!companyAdminRepository.existsById(new CompanyAdminId(userId, companyId))) {
            throw new SecurityException("Bạn không có quyền upload logo cho công ty này");
        }

        // 0.2) Lấy company
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy company"));

        // 1) Chuẩn bị thư mục
        Path logoDir =  readyDirectory("/app/uploads", "company-logos");

        // 2) Tên file mới (UUID + ext whitelist)
        Path newPath = generateFileName(file, logoDir);
        String newName = newPath.getFileName().toString();

        // 3) Ghi file & xác thực ảnh thật bằng ImageIO
        saveAndValidateImage(file, newPath);

        // 4) Cập nhật DB trước (nếu DB fail thì xoá file mới)
        String oldUrl = company.getLogoUrl();
        String newUrl = "/company-logos/" + newName;
        company.setLogoUrl(newUrl);
        try {
            companyRepository.saveAndFlush(company);
        } catch (RuntimeException ex) {
            try { Files.deleteIfExists(newPath); } catch (IOException ignore) {}
            throw ex;
        }

        // 5) Xoá file cũ (chỉ local và trong /company-logos/)
        deleteFile(logoDir, oldUrl, logoDir);

        return newUrl;
    }

    private String generateUniqueSlug(String base) {
        String slug = Slugifier.slugify(base);

        if (!companyRepository.existsBySlug(slug)) {
            return slug;
        } else {
            int suffix = 2;
            while (true) {
                String newSlug = slug + "-" + suffix;
                if (!companyRepository.existsBySlug(newSlug)) {
                    return newSlug;
                }
                suffix++;
            }
        }
    }
}

