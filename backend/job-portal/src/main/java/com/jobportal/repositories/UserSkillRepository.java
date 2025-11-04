package com.jobportal.repositories;

import com.jobportal.dtos.resources.UserSkillResource;
import com.jobportal.entities.UserSkill;
import com.jobportal.entities.UserSkillId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface UserSkillRepository extends JpaRepository<UserSkill, UserSkillId> {
    boolean existsById(UserSkillId id);

    @Query("""
    select new com.jobportal.dtos.resources.UserSkillResource(
        us.skill.id, us.skill.name, us.skill.slug
    )
    from UserSkill us
    where us.user.id = :userId
    order by us.skill.name asc
""")
    List<UserSkillResource> findSkillViewsByUserId(Long userId);
}
