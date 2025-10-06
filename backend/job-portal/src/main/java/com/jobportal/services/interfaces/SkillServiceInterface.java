package com.jobportal.services.interfaces;

import com.jobportal.entities.Skill;

import java.util.List;
import java.util.Map;

public interface SkillServiceInterface {
    List<Skill> getAllSkills(Map<String, String[]> params);
}
