package com.jobportal.services.interfaces;

import com.jobportal.dtos.requests.CompanyCreationRequest;
import com.jobportal.dtos.requests.CompanyUpdationRequest;
import com.jobportal.dtos.resources.CompanyResource;
import com.jobportal.entities.Company;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CompanyServiceInterface {
    CompanyResource getCompanyBySlug(String companySlug);
    Company createCompany(Long userId ,CompanyCreationRequest request);
    List<Company> getListCompany(Long userId);
    Company updateCompany(Long userId, Long companyId, CompanyUpdationRequest request);
    String uploadCompanyLogo(Long userId, Long companyId, MultipartFile file);
}
