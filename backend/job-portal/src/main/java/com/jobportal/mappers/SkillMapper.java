package com.jobportal.mappers;

import com.jobportal.commons.BaseMapper;
import com.jobportal.dtos.resources.SkillResource;
import com.jobportal.entities.Skill;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SkillMapper extends BaseMapper<Skill, SkillResource, Object, Object> {
}
