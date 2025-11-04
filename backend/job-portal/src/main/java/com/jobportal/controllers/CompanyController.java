package com.jobportal.controllers;

import com.jobportal.dtos.requests.creation.CompanyCreationRequest;
import com.jobportal.dtos.requests.updation.CompanyUpdationRequest;
import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.CompanyResource;
import com.jobportal.securities.exceptions.BusinessException;
import com.jobportal.securities.helps.details.CustomUserDetails;
import com.jobportal.entities.Company;
import com.jobportal.mappers.CompanyMapper;
import com.jobportal.services.interfaces.AuthServiceInterface;
import com.jobportal.services.interfaces.CompanyServiceInterface;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    @GetMapping("/my-company/list")
    public ApiResource<List<CompanyResource>> getMyCompanies(@AuthenticationPrincipal CustomUserDetails user) {
        Long userId = user.getUserId();
        List<Company> companies = companyService.getListCompany(userId);
        return ApiResource.ok(companyMapper.tResourceList(companies), "Lấy danh sách công ty thành công");
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping(value = "/my-company/upload-logo/{companyId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResource<String> uploadLogo(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long companyId,
            @RequestPart("logo") MultipartFile logo // dùng đúng key "logo"
    ) {
        if (logo == null || logo.isEmpty()) {
            throw new BusinessException("BAD_REQUEST", "Logo rỗng hoặc thiếu part 'logo'", HttpStatus.BAD_REQUEST);
        }
        Long userId = user.getUserId();
        String logoUrl = companyService.uploadCompanyLogo(userId, companyId, logo);
        return ApiResource.ok(logoUrl, "Upload logo thành công");
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/my-company/{companyId}")
    public ApiResource<CompanyResource> updateCompany(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long companyId,
            @Valid @RequestBody CompanyUpdationRequest request
    ) {
        Long userId = user.getUserId();
        Company company = companyService.updateCompany(userId, companyId, request);
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
}
