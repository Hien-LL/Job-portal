package com.jobportal.services.impl;

import com.jobportal.commons.BaseService;
import com.jobportal.commons.BaseSpecification;
import com.jobportal.commons.Slugifier;
import com.jobportal.dtos.requests.creation.JobCreationRequest;
import com.jobportal.dtos.requests.updation.JobUpdationRequest;
import com.jobportal.dtos.resources.JobResource;
import com.jobportal.entities.*;
import com.jobportal.mappers.JobMapper;
import com.jobportal.repositories.*;
import com.jobportal.securities.filters.FilterParameter;
import com.jobportal.services.interfaces.JobServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class JobService extends BaseService implements JobServiceInterface {
    private final JobRepository jobRepository;
    private final JobMapper jobMapper;
    private final CompanyAdminRepository companyAdminRepository;
    private final CompanyRepository companyRepository;
    private final BenefitRepository benefitRepository;
    private final CategoryRepository categoryRepository;
    private final LocationRepository locationRepository;

    @Override
    public JobResource createJobForMyCompany(Long userId, Long companyId, JobCreationRequest request) {
        if (!companyAdminRepository.existsById(new CompanyAdminId(userId, companyId))) {
            throw new SecurityException("Bạn không có quyền tạo việc làm cho công ty này");
        }

        // lấy công ty đúng
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy công ty"));

        // kiểm tra categoryId có null không
        if (request.getCategoryId() == null) {
            throw new IllegalArgumentException("Thiếu categoryId");
        }
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy danh mục công việc"));

        // location theo zipcode
        Location location = locationRepository.findByCountryCode(request.getLocationCountryCode())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vị trí công việc"));

        List<Benefit> benefits = benefitRepository.findAllById(request.getBenefitIds());

        Job job = jobMapper.tEntity(request);
        job.setCompany(company);
        job.setCategory(category);
        job.setLocation(location);
        job.setBenefits(benefits);

        String unique = generateUniqueSlug(request.getTitle().toLowerCase());
        job.setSlug(unique);

        jobRepository.save(job);
        return jobMapper.tResource(job);
    }

    @Override
    public JobResource getJobDetailBySlug(String slug) {
        Job job = jobRepository.findDetailBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy việc làm với slug: " + slug));
        return jobMapper.tResource(job);
    }

    @Override
    @Transactional
    public JobResource updateJobForMyCompany(Long userId, Long companyId, Long jobId, JobUpdationRequest request) {
        assertCompanyAdmin(userId, companyId);

        Job job = jobRepository.findDetailById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy việc làm với id: " + jobId));
        if (!job.getCompany().getId().equals(companyId)) {
            throw new SecurityException("Việc làm không thuộc công ty của bạn");
        }

        // 1) Map scalar fields — NULL -> IGNORE (giữ nguyên)
        jobMapper.updateEntityFromRequest(request, job);
        if (request.getTitle() != null) {
            String unique = generateUniqueSlug(request.getTitle().toLowerCase());
            job.setSlug(unique);
        }

        // 2) Quan hệ: chỉ set khi có truyền
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy danh mục công việc"));
            job.setCategory(category);
        }

        if (request.getLocationCountryCode() != null) {
            Location location = locationRepository.findByCountryCode(request.getLocationCountryCode())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vị trí công việc"));
            job.setLocation(location);
        }

        if (request.getBenefitIds() != null) {
            List<Benefit> benefits = request.getBenefitIds().isEmpty()
                    ? List.of()
                    : benefitRepository.findAllById(request.getBenefitIds());
            job.setBenefits(benefits);
        }

        // 3) Parse thời gian nếu có (tránh đè khi null)
        // if (request.getExpiresAt()!=null) job.setExpiresAt(OffsetDateTime.parse(request.getExpiresAt()));
        // if (request.getPublishedAt()!=null) job.setPublishedAt(OffsetDateTime.parse(request.getPublishedAt()));

        // 4) Clear có chủ đích (nếu dùng)
        if (request.getFieldsToNullify() != null) {
            for (String f : request.getFieldsToNullify()) {
                switch (f) {
                    case "description" -> job.setDescription(null);
                    case "slug" -> job.setSlug(null);
                    // bổ sung nếu cần
                }
            }
        }

        jobRepository.save(job);

        Job loaded = jobRepository.findDetailById(job.getId())
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy sau khi cập nhật"));
        return jobMapper.tResource(loaded);
    }

    private void assertCompanyAdmin(Long userId, Long companyId) {
        if (!companyAdminRepository.existsById(new CompanyAdminId(userId, companyId))) {
            throw new SecurityException("Bạn không có quyền thao tác với công ty này");
        }
    }



    @Override
    public Page<Job> paginationJob(Map<String, String[]> params) {
        int page = params.containsKey("page") ? Integer.parseInt(params.get("page")[0]) - 1 : 0;
        int size = params.containsKey("size") ? Integer.parseInt(params.get("size")[0]) : 10;
        Sort sort = sortParam(params);
        Pageable pageable = PageRequest.of(page, size, sort);

        String keyword = FilterParameter.filtertKeyword(params);
        Map<String, String> filterSimple = FilterParameter.filterSimple(params);
        Map<String, Map<String, String>> filterComplex = FilterParameter.filterComplex(params);

        Specification<Job> spec = Specification.where(
                        BaseSpecification.<Job>keyword(
                                keyword,
                                "title", "description", "seniority", "employmentType", "currency", "remote"
                        )
                )
                .and(BaseSpecification.whereSpec(filterSimple))
                .and(BaseSpecification.complexWhereSpec(filterComplex));

        // NEW: lọc benefits nếu có
        Set<Long> benefitIds = FilterParameter.getSetLong(params, "benefitIds");
        spec = spec.and(BaseSpecification.hasAnyBenefit(benefitIds));

        return jobRepository.findAll(spec, pageable);
    }

    public void deleteJobForMyCompany(Long userId, Long companyId, Long jobId) {
        assertCompanyAdmin(userId, companyId);

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy việc làm với id: " + jobId));
        if (!job.getCompany().getId().equals(companyId)) {
            throw new SecurityException("Việc làm không thuộc công ty của bạn");
        }

        jobRepository.delete(job);
    }

    private String generateUniqueSlug(String base) {
        String slug = Slugifier.slugify(base);

        if (!jobRepository.existsBySlug(slug)) {
            return slug;
        } else {
            int suffix = 2;
            while (true) {
                String newSlug = slug + "-" + suffix;
                if (!jobRepository.existsBySlug(newSlug)) {
                    return newSlug;
                }
                suffix++;
            }
        }
    }
}
