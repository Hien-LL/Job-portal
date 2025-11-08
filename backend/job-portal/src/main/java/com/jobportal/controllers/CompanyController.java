package com.jobportal.controllers;

import com.jobportal.dtos.requests.creation.CompanyCreationRequest;
import com.jobportal.dtos.requests.updation.CompanyUpdationRequest;
import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.CompanyResource;
import com.jobportal.dtos.resources.JobListItemResource;
import com.jobportal.entities.Job;
import com.jobportal.mappers.JobMapper;
import com.jobportal.securities.exceptions.BusinessException;
import com.jobportal.securities.helps.details.CustomUserDetails;
import com.jobportal.entities.Company;
import com.jobportal.mappers.CompanyMapper;
import com.jobportal.services.interfaces.AuthServiceInterface;
import com.jobportal.services.interfaces.CompanyServiceInterface;
import com.jobportal.services.interfaces.JobServiceInterface;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyServiceInterface companyService;
    private final CompanyMapper companyMapper;
    private final  AuthServiceInterface authService;
    private final JobServiceInterface  jobService;
    private final JobMapper jobMapper;

    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ApiResource<CompanyResource> createCompany(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody CompanyCreationRequest request
    ) {
        Long userId = user.getUserId();
        Company company = companyService.createCompany(userId, request);
        return ApiResource.ok(companyMapper.tResource(company), "Tạo công ty thành công");
    }

    @GetMapping("/list")
    public ApiResource<List<CompanyResource>> getAllCompanies(HttpServletRequest request) {
        Map<String, String[]> parameterMap = request.getParameterMap();

        List<CompanyResource> companies = companyService.getAllCompanies(parameterMap);
        return ApiResource.ok(companies, "Lấy danh sách công ty thành công");
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/my-company/details")
    public ApiResource<CompanyResource> getMyCompanies(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        Long userId = user.getUserId();
        Company company = companyService.getMyCompany(userId);
        return ApiResource.ok(companyMapper.tResource(company), "Lấy công ty của tôi thành công");
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping(value = "/my-company/upload-logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResource<String> uploadLogo(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestPart("logo") MultipartFile logo
    ) {
        if (logo == null || logo.isEmpty()) {
            throw new BusinessException("BAD_REQUEST", "Logo rỗng hoặc thiếu part 'logo'", HttpStatus.BAD_REQUEST);
        }
        String url = companyService.uploadCompanyImage(user.getUserId(), logo, "logo");
        return ApiResource.ok(url, "Upload logo thành công");
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping(value = "/my-company/upload-background", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResource<String> uploadBackground(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestPart("background") MultipartFile background
    ) {
        if (background == null || background.isEmpty()) {
            throw new BusinessException("BAD_REQUEST", "Background rỗng hoặc thiếu part 'background'", HttpStatus.BAD_REQUEST);
        }
        String url = companyService.uploadCompanyImage(user.getUserId(), background, "background");
        return ApiResource.ok(url, "Upload background thành công");
    }


    @PreAuthorize("isAuthenticated()")
    @PutMapping("/my-company/details")
    public ApiResource<CompanyResource> updateCompany(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody CompanyUpdationRequest request
    ) {
        Long userId = user.getUserId();
        Company company = companyService.updateCompany(userId, request);
        return ApiResource.ok(companyMapper.tResource(company), "Cập nhật công ty thành công");
    }

    @GetMapping("/{companySlug}")
    public ApiResource<CompanyResource> getCompanyBySlug(@PathVariable String companySlug) {
        CompanyResource company = companyService.getCompanyBySlug(companySlug);
        return ApiResource.ok(company, "Lấy thông tin công ty thành công");
    }

    @GetMapping("/detail/{companyId}")
    public ApiResource<CompanyResource> getCompanyById(@PathVariable Long companyId) {
        CompanyResource company = companyService.getCompanyById(companyId);
        return ApiResource.ok(company, "Lấy thông tin công ty thành công");
    }

    @GetMapping("jobs/{companyId}")
    public ApiResource<Page<JobListItemResource>> getJobsByCompanyId(
            @Positive(message = "id phải lớn hơn 0") @PathVariable Long companyId,
            HttpServletRequest request
    ) {
        Map<String, String[]> params = request.getParameterMap();
        Page<Job> jobs = jobService.getJobsByCompanyId(companyId, params);
        Page<JobListItemResource> jobResources = jobMapper.tListResourcePage(jobs);
        return ApiResource.ok(jobResources, "Success");
    }
}
