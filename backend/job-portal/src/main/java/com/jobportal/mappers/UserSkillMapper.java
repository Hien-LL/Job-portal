package com.jobportal.mappers;

import com.jobportal.dtos.resources.SkillResource;
import com.jobportal.dtos.resources.UserSkillResource;
import com.jobportal.entities.UserSkill;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface UserSkillMapper {
    @Mapping(target = "id", source = "skill.id")
    @Mapping(target = "name", source = "skill.name")
    @Mapping(target = "slug", source = "skill.slug")
    UserSkillResource tResource(UserSkill userSkill);

    List<SkillResource> tResourceList(Set<UserSkill> userSkills);
    SkillResource tResourceSingle(UserSkillResource userSkillResource);
}
