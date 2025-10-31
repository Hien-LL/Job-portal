package com.jobportal.mappers;

import com.jobportal.commons.BaseMapper;
import com.jobportal.dtos.resources.SkillResource;
import com.jobportal.entities.Skill;
import org.mapstruct.Mapper;

    import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface SkillMapper extends BaseMapper<Skill, SkillResource, Object, Object> {
    List<SkillResource> tResources(Set<Skill> entities); // Set -> List

}
