package com.jobportal.controllers;

import com.jobportal.dtos.requests.CompanyCreationRequest;
import com.jobportal.dtos.requests.CompanyUpdationRequest;
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
    @PostMapping("/me")
    public ResponseEntity<?> createCompany(@Valid @RequestBody CompanyCreationRequest request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            UserProfileResource user = authService.getUserFromEmail(email);

            Company company = companyService.createCompany(user.getId(),  request);
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

    @GetMapping("/me")
    public ResponseEntity<?> getListCompany() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            UserProfileResource user = authService.getUserFromEmail(email);

            List<Company> companies = companyService.getListCompany(user.getId());
            List<CompanyResource> companyResource = companyMapper.tResourceList(companies);
            return ResponseEntity.ok(ApiResource.ok(companyResource, "Tạo công ty thành công"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @PutMapping(value = "/me/upload-logo/{companyId}" , consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadLogo(@PathVariable Long companyId, @RequestPart("logo") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(
                        ApiResource.error("BAD_REQUEST", "File rỗng hoặc thiếu part 'file'", HttpStatus.BAD_REQUEST)
                );
            }

            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            UserProfileResource user = authService.getUserFromEmail(email);

            String avatarUrl = companyService.uploadCompanyLogo(user.getId(),companyId, file);
            return ResponseEntity.ok(ApiResource.ok(avatarUrl, "Upload avatar thành công"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResource.error("NOT_FOUND", e.getMessage(), HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResource.error("INTERNAL_SERVER_ERROR", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @PutMapping("/me/{companyId}")
    public ResponseEntity<?> updateCompany(@PathVariable Long companyId, @Valid @RequestBody CompanyUpdationRequest request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            UserProfileResource user = authService.getUserFromEmail(email);

            Company company = companyService.updateCompany(user.getId(), companyId, request);
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
}
