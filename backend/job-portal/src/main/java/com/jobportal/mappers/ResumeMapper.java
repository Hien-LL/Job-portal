package com.jobportal.mappers;

import com.jobportal.commons.BaseMapper;
import com.jobportal.dtos.requests.ResumeCreationRequest;
import com.jobportal.dtos.requests.ResumeUpdationRequest;
import com.jobportal.dtos.resources.ResumeResource;
import com.jobportal.entities.Resume;
import com.jobportal.entities.ResumeEducation;
import com.jobportal.entities.ResumeExperience;
import com.jobportal.entities.ResumeFile;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {ResumeEducation.class, ResumeFile.class, ResumeExperience.class})
public interface ResumeMapper extends BaseMapper<Resume, ResumeResource, ResumeCreationRequest, ResumeUpdationRequest> {
}
