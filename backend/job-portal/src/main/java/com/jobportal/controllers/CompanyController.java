package com.jobportal.controllers;

import com.jobportal.dtos.requests.creation.CompanyCreationRequest;
import com.jobportal.dtos.requests.updation.CompanyUpdationRequest;
import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.CompanyResource;
import com.jobportal.dtos.resources.UserProfileResource;
import com.jobportal.entities.Company;
import com.jobportal.mappers.CompanyMapper;
import com.jobportal.services.interfaces.AuthServiceInterface;
import com.jobportal.services.interfaces.CompanyServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {
    private final CompanyServiceInterface companyService;
    private final AuthServiceInterface authService;
    private final CompanyMapper companyMapper;

    @PostMapping
    public ResponseEntity<?> createCompany(@Valid @RequestBody CompanyCreationRequest request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            UserProfileResource userId = authService.getUserFromEmail(email);

            Company company = companyService.createCompany(userId.getId(),  request);
            CompanyResource companyResource = companyMapper.tResource(company);
            return ResponseEntity.ok(ApiResource.ok(companyResource, "Tạo công ty thành công"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @GetMapping("/my-company/list")
    public ResponseEntity<?> getListCompany() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId = authService.getUserFromEmail(email).getId();

            List<Company> companies = companyService.getListCompany(userId);
            List<CompanyResource> companyResource = companyMapper.tResourceList(companies);
            return ResponseEntity.ok(ApiResource.ok(companyResource, "Lấy danh sách công ty thành công"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @PutMapping(value = "/my-company/upload-logo/{companyId}" , consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadLogo(@PathVariable Long companyId, @RequestPart("logo") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(
                        ApiResource.error("BAD_REQUEST", "File rỗng hoặc thiếu part 'file'", HttpStatus.BAD_REQUEST)
                );
            }

            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId = authService.getUserFromEmail(email).getId();

            String avatarUrl = companyService.uploadCompanyLogo(userId,companyId, file);
            return ResponseEntity.ok(ApiResource.ok(avatarUrl, "Upload avatar thành công"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @PutMapping("/my-company/{companyId}")
    public ResponseEntity<?> updateCompany(@PathVariable Long companyId, @Valid @RequestBody CompanyUpdationRequest request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId = authService.getUserFromEmail(email).getId();

            Company company = companyService.updateCompany(userId, companyId, request);
            CompanyResource companyResource = companyMapper.tResource(company);
            return ResponseEntity.ok(ApiResource.ok(companyResource, "Cập nhật công ty thành công"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResource.error("FORBIDDEN", e.getMessage(), HttpStatus.FORBIDDEN));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @GetMapping("/{companySlug}" )
    public ResponseEntity<?> getCompanyBySlug(@PathVariable String companySlug) {
        try {
            CompanyResource companyResource = companyService.getCompanyBySlug(companySlug);
            return ResponseEntity.ok(ApiResource.ok(companyResource, "Lấy thông tin công ty thành công"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
