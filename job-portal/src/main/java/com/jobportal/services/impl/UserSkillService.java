package com.jobportal.services.impl;

import com.jobportal.dtos.resources.UserSkillResource;
import com.jobportal.entities.Skill;
import com.jobportal.entities.User;
import com.jobportal.entities.UserSkill;
import com.jobportal.entities.UserSkillId;
import com.jobportal.repositories.SkillRepository;
import com.jobportal.repositories.UserRepository;
import com.jobportal.repositories.UserSkillRepository;
import com.jobportal.services.interfaces.UserSkillServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserSkillService implements UserSkillServiceInterface {
    private final UserRepository userRepo;
    private final SkillRepository skillRepo;
    private final UserSkillRepository userSkillRepo;

    @Override
    public void addSkillToUser(Long userId, String Slug) {

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        Skill skill = skillRepo.findBySlug(Slug)
                .orElseThrow(() -> new IllegalArgumentException("Kỹ năng không tồn tại"));

        var id = new UserSkillId(userId, skill.getId());
        if (userSkillRepo.existsById(id)) {
            throw new IllegalArgumentException("Kỹ năng đã được thêm cho người dùng");
        }

        var userSkill = UserSkill.builder()
                .id(id)
                .user(user)
                .skill(skill)
                .build();
        userSkillRepo.save(userSkill);
    }

    @Override
    public void removeSkillFromUser(Long userId, String slug) {
        var skill = skillRepo.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Kỹ năng không tồn tại"));
        var id = new UserSkillId(userId, skill.getId());

        if (!userSkillRepo.existsById(id)) {
            throw new IllegalArgumentException("Kỹ năng không được gán cho người dùng");
        }
        userSkillRepo.deleteById(id);
    }

    @Override
    public List<UserSkillResource> getSkillsById(Long userId) {
        if (!userRepo.existsById(userId)) {
            throw new IllegalArgumentException("Người dùng không tồn tại");
        }

        return userSkillRepo.findSkillViewsByUserId(userId);
    }
}
