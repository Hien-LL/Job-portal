package com.jobportal.mappers;

import com.jobportal.commons.BaseMapper;
import com.jobportal.dtos.requests.creation.ResumeCreationRequest;
import com.jobportal.dtos.requests.updation.ResumeUpdationRequest;
import com.jobportal.dtos.resources.ResumeResource;
import com.jobportal.entities.Resume;
import com.jobportal.entities.ResumeEducation;
import com.jobportal.entities.ResumeExperience;
import com.jobportal.entities.ResumeFile;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ResumeMapper extends BaseMapper<Resume, ResumeResource, ResumeCreationRequest, ResumeUpdationRequest> {
    @Override
    @BeanMapping(ignoreByDefault = true,
            nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(target = "title", source = "title"),
            @Mapping(target = "summary", source = "summary"),
            // QUAN TRỌNG: property name là "default" (JavaBeans), không phải "isDefault"
            @Mapping(target = "default", source = "default"),
            // không map trực tiếp collections, merge ở service
            @Mapping(target = "experiences", ignore = true),
            @Mapping(target = "educations", ignore = true),
            @Mapping(target = "files", ignore = true)
    })
    void updateEntityFromRequest(ResumeUpdationRequest req, @MappingTarget Resume entity);

}
