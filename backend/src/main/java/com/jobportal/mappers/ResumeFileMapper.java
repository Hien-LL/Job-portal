package com.jobportal.mappers;

import com.jobportal.commons.BaseMapper;
import com.jobportal.dtos.resources.ResumeFileResource;
import com.jobportal.entities.ResumeFile;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ResumeFileMapper extends BaseMapper<ResumeFile, ResumeFileResource, Object, Object> {
}
