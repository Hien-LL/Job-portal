package com.jobportal.services.impl;

import com.jobportal.commons.BaseService;
import com.jobportal.commons.Slugifier;
import com.jobportal.dtos.requests.creation.CompanyCreationRequest;
import com.jobportal.dtos.requests.updation.CompanyUpdationRequest;
import com.jobportal.dtos.resources.CompanyResource;
import com.jobportal.entities.Company;
import com.jobportal.entities.CompanyAdminId;
import com.jobportal.entities.User;
import com.jobportal.mappers.CompanyMapper;
import com.jobportal.repositories.CompanyAdminRepository;
import com.jobportal.repositories.CompanyRepository;
import com.jobportal.repositories.FollowCompanyRepository;
import com.jobportal.repositories.UserRepository;
import com.jobportal.securities.configs.UploadConfig;
import com.jobportal.services.interfaces.CompanyServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanyService extends BaseService implements CompanyServiceInterface {
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;
    private final CompanyAdminService companyAdminService;
    private final CompanyAdminRepository companyAdminRepository;
    private final FollowCompanyRepository followCompanyRepository;
    private final UploadConfig uploadConfig;

    @Override
    public CompanyResource getCompanyBySlug(String companySlug) {
        Company company = companyRepository.findBySlug(companySlug)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy company"));

        CompanyResource companyResource = companyMapper.tResource(company);
        companyResource.setFollowerCount((int) followCompanyRepository.countByCompany_Id(company.getId()));
        return companyResource;
    }

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

    @Transactional
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

        if (request.getSize_min() > request.getSize_max()) {
            throw new IllegalArgumentException("size_min không được lớn hơn size_max");
        }

        if (request.getSize_max() > request.getSize_min()) {
            company.setSize_min(request.getSize_min());
            company.setSize_max(request.getSize_max());
        }

        companyRepository.save(company);
        return company;
    }

    @Transactional
    @Override
    public String uploadCompanyLogo(Long userId, Long companyId, MultipartFile file) {
        validateFileSize(file, uploadConfig.getMaxSize());
        validateExt(file, uploadConfig.getAllowedImageExt()); // chỉ ảnh

        if (!companyAdminRepository.existsById(new CompanyAdminId(userId, companyId))) {
            throw new SecurityException("Bạn không có quyền upload logo cho công ty này");
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy company"));

        Path logoDir = ensureDir(uploadConfig.getBaseDir(), uploadConfig.getCompanyLogoDir());

        String ext = extOf(file);
        String newName = UUID.randomUUID() + ext;
        Path newPath = logoDir.resolve(newName);

        write(file, newPath);
        assertRealImageOrRollback(newPath);

        String oldUrl = company.getLogoUrl();
        String newUrl = "/" + uploadConfig.getCompanyLogoDir() + "/" + newName;
        company.setLogoUrl(newUrl);
        try {
            companyRepository.saveAndFlush(company);
        } catch (RuntimeException ex) {
            try { Files.deleteIfExists(newPath); } catch (IOException ignore) {}
            throw ex;
        }

        deleteByPublicUrl("/" + uploadConfig.getCompanyLogoDir() + "/", oldUrl, uploadConfig.getBaseDir());
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

    // ===== helpers dùng chung =====
    private Path ensureDir(String... parts) {
        Path p = Paths.get("", parts).toAbsolutePath().normalize();
        try { Files.createDirectories(p); } catch (IOException e) { throw new RuntimeException("Không tạo được thư mục: " + p, e); }
        return p;
    }

    private void write(MultipartFile file, Path target) {
        try { Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING); }
        catch (IOException e) { throw new RuntimeException("Lưu file thất bại", e); }
    }

    private void assertRealImageOrRollback(Path path) {
        try {
            if (javax.imageio.ImageIO.read(path.toFile()) == null) {
                Files.deleteIfExists(path);
                throw new IllegalArgumentException("File không phải ảnh hợp lệ");
            }
        } catch (IOException e) {
            try { Files.deleteIfExists(path); } catch (IOException ignore) {}
            throw new RuntimeException("Không đọc được ảnh", e);
        }
    }

    private void validateFileSize(MultipartFile f, String max) {
        if (f == null || f.isEmpty()) throw new IllegalArgumentException("File rỗng");
        long maxBytes = org.springframework.util.unit.DataSize.parse(max).toBytes();
        if (f.getSize() > maxBytes) throw new IllegalArgumentException("Dung lượng vượt quá " + max);
    }

    private void validateExt(MultipartFile f, String allowedCsv) {
        String ext = extOf(f).replace(".", "");
        var allowed = java.util.Arrays.stream(allowedCsv.split(",")).map(String::trim).map(String::toLowerCase).toList();
        if (!allowed.contains(ext.toLowerCase())) {
            throw new IllegalArgumentException("Định dạng không hợp lệ: ." + ext + " (cho phép: " + allowedCsv + ")");
        }
    }

    private String extOf(MultipartFile f) {
        String name = org.springframework.util.StringUtils.getFilename(f.getOriginalFilename());
        String ext = (name != null && name.contains(".")) ? name.substring(name.lastIndexOf('.')).toLowerCase() : "";
        if (ext.isBlank()) throw new IllegalArgumentException("Thiếu đuôi file");
        return ext;
    }

    private void deleteByPublicUrl(String urlPrefix, String oldUrl, String baseDir) {
        if (oldUrl == null || !oldUrl.startsWith(urlPrefix)) return;
        String filename = oldUrl.substring(urlPrefix.length());
        Path p = Paths.get(baseDir).resolve(urlPrefix.substring(1)).resolve(filename).normalize();
        try { Files.deleteIfExists(p); } catch (IOException ignore) {}
    }

}

