package com.jobportal.mappers;

import com.jobportal.commons.BaseMapper;
import com.jobportal.dtos.requests.JobCreationRequest;
import com.jobportal.dtos.requests.JobUpdationRequest;
import com.jobportal.dtos.resources.JobListItemResource;
import com.jobportal.dtos.resources.JobResource;
import com.jobportal.entities.*;
import org.mapstruct.Mapper;
import org.springframework.data.domain.Page;

@Mapper(componentModel = "spring", uses = {Category.class, Location.class, Benefit.class, Company.class})
public interface JobMapper extends BaseMapper<Job, JobResource, JobCreationRequest, JobUpdationRequest> {
    JobListItemResource tListItemResource(Job job);

    default Page<JobListItemResource> tListResourcePage(Page<Job> jobs) {
        return jobs.map(this::tListItemResource);
    }
}
