package com.jobportal.services.interfaces;

import com.jobportal.dtos.resources.UserSkillResource;
import java.util.List;

public interface UserSkillServiceInterface {
    void addSkillToUser(Long userId, String slug, int yearsOfExperience);
    void removeSkillFromUser(Long userId, String slug);
    List<UserSkillResource> getSkillsById(Long userId);
    void updateYearsBySlug(Long userId, String slug, int yearsOfExperience);
}
