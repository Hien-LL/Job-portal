package com.jobportal.services.impl;

import com.jobportal.commons.BaseService;
import com.jobportal.commons.BaseSpecification;
import com.jobportal.commons.Slugifier;
import com.jobportal.dtos.requests.creation.JobCreationRequest;
import com.jobportal.dtos.requests.updation.JobUpdationRequest;
import com.jobportal.dtos.resources.CompanyResource;
import com.jobportal.dtos.resources.JobResource;
import com.jobportal.entities.*;
import com.jobportal.mappers.BenefitMapper;
import com.jobportal.mappers.CompanyMapper;
import com.jobportal.mappers.JobMapper;
import com.jobportal.repositories.*;
import com.jobportal.securities.filters.FilterParameter;
import com.jobportal.services.interfaces.JobServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.*;

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
    private final CompanyMapper companyMapper;
    private final FollowCompanyRepository followCompanyRepository;
    private final SkillRepository skillRepository;
    private final SavedJobRepository savedJobRepository;
    private final CompanyAdminRepository adminRepository;
    private final BenefitMapper benefitMapper;


    @Override
    @Transactional
    public JobResource createJobForMyCompany(Long userId, JobCreationRequest request) {
        Company company  = adminRepository.findCompanyByAdminUserId(userId)
                .orElseThrow(() -> new SecurityException("Bạn không có quyền tạo việc làm cho công ty nào"));

        // kiểm tra categoryId có null không
        if (request.getCategoryId() == null) {
            throw new IllegalArgumentException("Thiếu categoryId");
        }
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy danh mục công việc"));

        // location theo zipcode
        Location location = locationRepository.findByCountryCode(request.getLocationCountryCode())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vị trí công việc"));

        Set<Benefit> benefits = (Set<Benefit>) benefitRepository.findAllById(request.getBenefitIds());
        List<Skill> skills =skillRepository.findAllById(request.getSkillIds());

        Job job = jobMapper.tEntity(request);
        job.setCompany(company);
        job.setCategory(category);
        job.setLocation(location);
        job.setBenefits(benefits);
        job.setSkills(new LinkedHashSet<>(skills));

        String unique = generateUniqueSlug(request.getTitle().toLowerCase());
        job.setSlug(unique);

        jobRepository.save(job);
        return jobMapper.tResource(job);
    }

    @Override
    public JobResource getJobDetailBySlug(String slug) {
        Job job = jobRepository.findDetailBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy việc làm với slug: " + slug));

        JobResource jobResource = jobMapper.tResource(job);
        CompanyResource companyResource = companyMapper.tResource(job.getCompany());
        companyResource.setFollowerCount((int) followCompanyRepository.countByCompany_Id(job.getCompany().getId()));
        jobResource.setCompany(companyResource);
        return jobResource;
    }

    @Override
    @Transactional
    public JobResource updateJobForMyCompany(Long userId, Long jobId, JobUpdationRequest request) {
        Company company = adminRepository.findCompanyByAdminUserId(userId)
                .orElseThrow(() -> new SecurityException("Bạn không có quyền cập nhật việc làm cho công ty nào"));
        Long companyId = company.getId();

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
            Set<Benefit> benefits = request.getBenefitIds().isEmpty()
                    ? new LinkedHashSet<>()
                    : new LinkedHashSet<>(benefitRepository.findAllById(request.getBenefitIds()));
            job.setBenefits(benefits);
        }

        if (request.getSkillIds() != null) {
            Set<Skill> skills = request.getSkillIds().isEmpty()
                    ? new LinkedHashSet<>()
                    : new LinkedHashSet<>(skillRepository.findAllById(request.getSkillIds()));
            job.setSkills(skills);
        }

        // 3) Parse thời gian nếu có (tránh đè khi null)
        // if (request.getExpiresAt()!=null) job.setExpiresAt(OffsetDateTime.parse(request.getExpiresAt()));
         if (request.getPublishedAt()!=null) job.setPublishedAt(Instant.from(OffsetDateTime.parse(request.getPublishedAt()).toLocalDateTime()));

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
        if (!companyAdminRepository.existsByCompany_IdAndUser_Id(companyId, userId)) {
            throw new SecurityException("Bạn không có quyền thao tác với công ty này");
        }
    }



    @Override
    public Page<Job> paginationJob(Map<String, String[]> params, boolean includeAll) {
        int page = params.containsKey("page") ? Integer.parseInt(params.get("page")[0]) - 1 : 0;
        int size = params.containsKey("size") ? Integer.parseInt(params.get("size")[0]) : 12;
        Sort sort = sortParam(params);
        Pageable pageable = PageRequest.of(page, size, sort);

        String keyword = FilterParameter.filtertKeyword(params);
        Map<String, String> filterSimple = FilterParameter.filterSimple(params);
        Map<String, Map<String, String>> filterComplex = FilterParameter.filterComplex(params);

        Specification<Job> spec = Specification
                .where(BaseSpecification.<Job>keyword(
                        keyword, "title", "description", "seniority", "employmentType", "currency", "remote"))
                .and(BaseSpecification.whereSpec(filterSimple))
                .and(BaseSpecification.complexWhereSpec(filterComplex));

        // benefits
        Set<Long> benefitIds = FilterParameter.getSetLong(params, "benefitIds");
        spec = spec.and(BaseSpecification.hasAnyBenefit(benefitIds));

        // ép published=true cho public
        if (!includeAll) {
            spec = spec.and((root, q, cb) -> cb.isTrue(root.get("published")));
        }

        return jobRepository.findAll(spec, pageable);
    }


    @Override
    @Transactional
    public void deleteJobForMyCompany(Long userId, Long jobId) {
        Company company  = adminRepository.findCompanyByAdminUserId(userId)
                .orElseThrow(() -> new SecurityException("Bạn không có quyền xóa việc làm cho công ty nào"));
        Long companyId = company.getId();

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy việc làm với id: " + jobId));
        if (!job.getCompany().getId().equals(companyId)) {
            throw new SecurityException("Việc làm không thuộc công ty của bạn");
        }
        savedJobRepository.deleteAllByJob_Id(jobId);
        jobRepository.delete(job);
    }

    @Override
    public Page<Job> getJobsByCompanyId(Long companyId, Map<String, String[]> params) {
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
                .and(BaseSpecification.complexWhereSpec(filterComplex))
                .and(BaseSpecification.equalLong("company.id", companyId));
        // ép published=true cho public
        spec = spec.and((root, q, cb) -> cb.isTrue(root.get("published")));
        return jobRepository.findAll(spec, pageable);
    }

    @Override
    public JobResource getJobForMyCompany(Long userId,Long jobId) {
        Company company  = adminRepository.findCompanyByAdminUserId(userId)
                .orElseThrow(() -> new SecurityException("Bạn không có quyền xem việc làm cho công ty nào"));
        Long companyId = company.getId();

        Job job = jobRepository.findDetailById(jobId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy việc làm với id: " + jobId));
        if (!job.getCompany().getId().equals(companyId)) {
            throw new SecurityException("Việc làm không thuộc công ty của bạn");
        }
        return jobMapper.tResource(job);
    }

    @Override
    public Page<Job> paginationJobForMyCompany(Long userId, Map<String, String[]> params) {
        Company company  = adminRepository.findCompanyByAdminUserId(userId)
                .orElseThrow(() -> new SecurityException("Bạn không có quyền xem việc làm cho công ty nào"));
        Long companyId = company.getId();

        int page = params.containsKey("page") ? Integer.parseInt(params.get("page")[0]) - 1 : 0;
        int size = params.containsKey("size") ? Integer.parseInt(params.get("size")[0]) : 5;
        Sort sort = sortParam(params);
        Pageable pageable = PageRequest.of(page, size, sort);

        String keyword = FilterParameter.filtertKeyword(params);
        Map<String, String> filterSimple = FilterParameter.filterSimple(params);
        Map<String, Map<String, String>> filterComplex = FilterParameter.filterComplex(params);

        Specification<Job> spec = Specification
                .where(BaseSpecification.<Job>keyword(
                        keyword, "title", "description", "seniority", "employmentType", "currency", "remote"))
                .and(BaseSpecification.whereSpec(filterSimple))
                .and(BaseSpecification.complexWhereSpec(filterComplex))
                .and(BaseSpecification.equalLong("company.id", companyId));
        return jobRepository.findAll(spec, pageable);
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
