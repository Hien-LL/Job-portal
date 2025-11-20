package com.jobportal.services.impl;

import com.jobportal.commons.BaseService;
import com.jobportal.commons.Slugifier;
import com.jobportal.dtos.requests.creation.CompanyCreationRequest;
import com.jobportal.dtos.requests.updation.CompanyUpdationRequest;
import com.jobportal.dtos.resources.CompanyResource;
import com.jobportal.entities.Company;
import com.jobportal.entities.User;
import com.jobportal.mappers.CompanyMapper;
import com.jobportal.repositories.CompanyAdminRepository;
import com.jobportal.repositories.CompanyRepository;
import com.jobportal.repositories.FollowCompanyRepository;
import com.jobportal.repositories.UserRepository;
import com.jobportal.securities.configs.UploadConfig;
import com.jobportal.securities.exceptions.BusinessException;
import com.jobportal.services.interfaces.CompanyServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

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

    // =================================================================
    //                          CORE METHODS
    // =================================================================

    @Override
    public CompanyResource getCompanyBySlug(String companySlug) {
        Company company = companyRepository.findBySlug(companySlug)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy company"));
        CompanyResource resource = companyMapper.tResource(company);
        resource.setFollowerCount((int) followCompanyRepository.countByCompany_Id(company.getId()));
        return resource;
    }

    @Override
    public Company createCompany(Long userId, CompanyCreationRequest request) {
        if (companyAdminRepository.existsByUser_Id(userId))
            throw new IllegalStateException("Bạn đã có công ty rồi");

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
    public Company getMyCompany(Long userId) {
        return companyAdminRepository.findCompanyByAdminUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Bạn chưa được link làm admin công ty nào"));
    }

    // =================================================================
    //                          UPDATE COMPANY
    // =================================================================

    @Transactional
    @Override
    public Company updateCompany(Long userId, CompanyUpdationRequest request) {
        Company company = companyAdminRepository.findCompanyByAdminUserId(userId)
                .orElseThrow(() -> new SecurityException("Bạn không có quyền cập nhật công ty này"));

        companyMapper.updateEntityFromRequest(request, company);

        if (request.getName() != null)
            company.setSlug(generateUniqueSlug(request.getName()));

        if (request.getSize_min() > request.getSize_max())
            throw new IllegalArgumentException("size_min không được lớn hơn size_max");

        company.setSize_min(request.getSize_min());
        company.setSize_max(request.getSize_max());

        companyRepository.save(company);
        return company;
    }

    // =================================================================
    //                          UPLOAD IMAGE
    // =================================================================

    @Transactional
    @Override
    public String uploadCompanyImage(Long userId, MultipartFile file, String type) {
        if (file == null || file.isEmpty())
            throw new IllegalArgumentException("File rỗng");

        validateFileSize(file, uploadConfig.getMaxSize());
        validateExt(file, uploadConfig.getAllowedImageExt()); // chỉ ảnh

        final String normalized = normalizeType(type);
        if (normalized == null)
            throw new IllegalArgumentException("type phải là LOGO hoặc BACKGROUND");

        Company company = companyAdminRepository.findCompanyByAdminUserId(userId)
                .orElseThrow(() -> new SecurityException("Bạn không có quyền cập nhật công ty này"));

        final String baseDir = requireConfigured(uploadConfig.getBaseDir(), "upload.base-dir");
        final String logoDir = requireConfigured(uploadConfig.getCompanyLogoDir(), "upload.company-logo-dir");
        final String bgDir = requireConfigured(uploadConfig.getBackgroundImageDir(), "upload.background-image-dir");

        final String targetDirName = "logo".equals(normalized) ? logoDir : bgDir;
        final Path targetDir = ensureDir(baseDir, targetDirName);
        final String publicPrefix = "/" + targetDirName + "/";

        String ext = extOf(file);
        String newName = UUID.randomUUID() + ext;
        Path newPath = targetDir.resolve(newName);

        write(file, newPath);
        assertRealImageOrRollback(newPath);

        String oldUrl;
        String newUrl = publicPrefix + newName;

        if ("logo".equals(normalized)) {
            oldUrl = company.getLogoUrl();
            company.setLogoUrl(newUrl);
        } else {
            oldUrl = company.getBackgroundImageUrl();
            company.setBackgroundImageUrl(newUrl);
        }

        try {
            companyRepository.saveAndFlush(company);
        } catch (RuntimeException ex) {
            try { Files.deleteIfExists(newPath); } catch (IOException ignore) {}
            throw ex;
        }

        if (oldUrl != null && !oldUrl.isBlank())
            deleteByPublicUrl(publicPrefix, oldUrl, baseDir);

        return newUrl;
    }

    private String normalizeType(String raw) {
        if (raw == null) return null;
        String t = raw.trim().toLowerCase();
        if (t.equals("logo")) return "logo";
        if (t.equals("background") || t.equals("background_image") || t.equals("banner")) return "background";
        return null;
    }

    private String requireConfigured(String value, String keyName) {
        if (value == null || value.isBlank())
            throw new BusinessException("SERVER_CONFIG", keyName + " chưa được cấu hình", HttpStatus.INTERNAL_SERVER_ERROR);
        return value;
    }

    // =================================================================
    //                          HELPERS
    // =================================================================

    private Path ensureDir(String baseDir, String relativeDir) {
        Path dir = Paths.get(baseDir, relativeDir).toAbsolutePath().normalize();
        try { Files.createDirectories(dir); }
        catch (IOException e) { throw new RuntimeException("Không tạo được thư mục: " + dir, e); }
        return dir;
    }

    private void write(MultipartFile file, Path target) {
        try { Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING); }
        catch (IOException e) { throw new RuntimeException("Lưu file thất bại", e); }
    }

    private void assertRealImageOrRollback(Path path) {
        try {
            if (ImageIO.read(path.toFile()) == null) {
                Files.deleteIfExists(path);
                throw new IllegalArgumentException("File không phải ảnh hợp lệ");
            }
        } catch (IOException e) {
            try { Files.deleteIfExists(path); } catch (IOException ignore) {}
            throw new RuntimeException("Không đọc được ảnh", e);
        }
    }

    private void deleteByPublicUrl(String urlPrefix, String oldUrl, String baseDir) {
        if (oldUrl == null || !oldUrl.startsWith(urlPrefix)) return;
        String filename = oldUrl.substring(urlPrefix.length());
        Path p = Paths.get(baseDir).resolve(urlPrefix.substring(1)).resolve(filename).normalize();
        try { Files.deleteIfExists(p); } catch (IOException ignore) {}
    }

    private void validateFileSize(MultipartFile f, String max) {
        long maxBytes = org.springframework.util.unit.DataSize.parse(max).toBytes();
        if (f.getSize() > maxBytes)
            throw new IllegalArgumentException("Dung lượng vượt quá " + max);
    }

    private void validateExt(MultipartFile f, String allowedCsv) {
        String ext = extOf(f).replace(".", "");
        var allowed = Arrays.stream(allowedCsv.split(",")).map(String::trim).map(String::toLowerCase).toList();
        if (!allowed.contains(ext.toLowerCase()))
            throw new IllegalArgumentException("Định dạng không hợp lệ: ." + ext + " (cho phép: " + allowedCsv + ")");
    }

    private String extOf(MultipartFile f) {
        String name = org.springframework.util.StringUtils.getFilename(f.getOriginalFilename());
        String ext = (name != null && name.contains(".")) ? name.substring(name.lastIndexOf('.')).toLowerCase() : "";
        if (ext.isBlank()) throw new IllegalArgumentException("Thiếu đuôi file");
        return ext;
    }

    private String generateUniqueSlug(String base) {
        String slug = Slugifier.slugify(base);
        int suffix = 2;
        while (companyRepository.existsBySlug(slug)) {
            slug = Slugifier.slugify(base) + "-" + suffix++;
        }
        return slug;
    }

    // =================================================================
    //                      GET ALL COMPANIES (unchanged)
    // =================================================================

    @Override
    public List<CompanyResource> getAllCompanies(Map<String, String[]> parameterMap) {
        Sort originalSort = sortParam(parameterMap);
        List<Sort.Order> allOrders = new ArrayList<>();
        originalSort.iterator().forEachRemaining(allOrders::add);

        List<Sort.Order> followerOrders = allOrders.stream()
                .filter(o -> o.getProperty().equalsIgnoreCase("followerCount"))
                .toList();

        Sort dbSort = Sort.by(allOrders.stream()
                .filter(o -> !o.getProperty().equalsIgnoreCase("followerCount"))
                .toList());

        Specification<Company> spec = specificationParam(parameterMap);
        List<Company> companies = companyRepository.findAll(spec, dbSort);
        if (companies.isEmpty()) return List.of();

        List<Long> ids = companies.stream().map(Company::getId).toList();
        Map<Long, Long> countMap = followCompanyRepository.countByCompanyIdsGrouped(ids).stream()
                .collect(java.util.stream.Collectors.toMap(
                        FollowCompanyRepository.CompanyFollowAgg::getCompanyId,
                        FollowCompanyRepository.CompanyFollowAgg::getCnt
                ));

        List<CompanyResource> resources = companies.stream().map(c -> {
            CompanyResource r = companyMapper.tResource(c);
            r.setFollowerCount(countMap.getOrDefault(c.getId(), 0L).intValue());
            return r;
        }).toList();

        if (!followerOrders.isEmpty()) {
            Sort.Order order = followerOrders.getFirst();
            Comparator<CompanyResource> cmp = Comparator.comparingInt(CompanyResource::getFollowerCount);
            if (order.isDescending()) cmp = cmp.reversed();
            cmp = cmp.thenComparing(CompanyResource::getId);
            resources = resources.stream().sorted(cmp).toList();
        }

        return resources;
    }

    @Override
    public CompanyResource getCompanyById(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy company"));
        CompanyResource r = companyMapper.tResource(company);
        r.setFollowerCount((int) followCompanyRepository.countByCompany_Id(company.getId()));
        return r;
    }

    @Override
    public boolean verifyCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy company"));
        if (company.isVerified()) {
            throw new IllegalStateException("Công ty đã được xác thực");
        }
        company.setVerified(true);
        companyRepository.save(company);
        return true;
    }
}
