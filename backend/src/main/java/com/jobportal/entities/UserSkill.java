package com.jobportal.entities;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_skills",
        uniqueConstraints = @UniqueConstraint(name = "uk_user_skill", columnNames = {"user_id", "skill_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSkill {
    @EmbeddedId
    private UserSkillId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_user_skill_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("skillId")
    @JoinColumn(name = "skill_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_user_skill_skill"))
    private Skill skill;
}
