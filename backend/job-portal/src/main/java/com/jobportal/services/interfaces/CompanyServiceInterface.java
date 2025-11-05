package com.jobportal.services.interfaces;

import com.jobportal.dtos.requests.creation.CompanyCreationRequest;
import com.jobportal.dtos.requests.updation.CompanyUpdationRequest;
import com.jobportal.dtos.resources.CompanyResource;
import com.jobportal.entities.Company;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface CompanyServiceInterface {
    CompanyResource getCompanyBySlug(String companySlug);
    Company createCompany(Long userId ,CompanyCreationRequest request);
    Company getMyCompany(Long userId);
    Company updateCompany(Long userId, CompanyUpdationRequest request);
    String uploadCompanyLogo(Long userId, MultipartFile file);
    List<CompanyResource> getAllCompanies(Map<String, String[]> parameterMap);
    CompanyResource getCompanyById(Long companyId);
}
