package com.jobportal.mappers;

import com.jobportal.dtos.resources.ApplicationStatusResource;
import com.jobportal.entities.ApplicationStatus;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ApplicationStatusMapper {
    ApplicationStatusResource tResource(ApplicationStatus entity);
    List<ApplicationStatusResource> tResourceList(List<ApplicationStatus> entities);
}

