package com.jobportal.mappers;

import com.jobportal.commons.BaseMapper;
import com.jobportal.dtos.requests.CompanyCreationRequest;
import com.jobportal.dtos.requests.CompanyUpdationRequest;
import com.jobportal.dtos.resources.CompanyResource;
import com.jobportal.entities.Company;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CompanyMapper extends BaseMapper<Company, CompanyResource, CompanyCreationRequest, CompanyUpdationRequest> {
}
