package com.jobportal.mappers;

import com.jobportal.dtos.resources.SavedJobResource;
import com.jobportal.entities.SavedJob;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SavedJobMapper {
    @Mapping(source = "job.id", target = "jobId")
    @Mapping(source = "job.title", target = "title")
    @Mapping(source = "job.slug", target = "slug")
    @Mapping(source = "job.company.name", target = "companyName")
    @Mapping(source = "job.company.logoUrl", target = "companyLogoUrl")
    @Mapping(source = "job.location.displayName", target = "location")
    @Mapping(source = "job.remote", target = "remote") // đúng property
    @Mapping(source = "job.salaryMin", target = "salaryMin")
    @Mapping(source = "job.salaryMax", target = "salaryMax")
    @Mapping(source = "job.currency", target = "currency")
    @Mapping(source = "job.employmentType", target = "employmentType")
    @Mapping(source = "savedAt", target = "savedAt")
    @Mapping(source = "job.expiresAt", target = "expiresAt")
        // expired có thể set ở service khi map từ entity: setExpired(job.getExpiresAt().isBefore(now))
    SavedJobResource tResource(SavedJob entity);
}


