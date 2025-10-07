package com.jobportal.dtos.resources;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserSkillResource {
    private Long skillId;
    private String name;
    private String slug;
    private int yearsExperience;

}
