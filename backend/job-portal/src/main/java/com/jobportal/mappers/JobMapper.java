package com.jobportal.mappers;

import com.jobportal.commons.BaseMapper;
import com.jobportal.dtos.requests.JobCreationRequest;
import com.jobportal.dtos.requests.JobUpdationRequest;
import com.jobportal.dtos.resources.JobResource;
import com.jobportal.entities.*;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {Category.class, Location.class, Benefit.class, Company.class})
public interface JobMapper extends BaseMapper<Job, JobResource, JobCreationRequest, JobUpdationRequest> {
}
