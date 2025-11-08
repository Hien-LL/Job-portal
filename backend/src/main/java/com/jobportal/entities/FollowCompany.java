// entities/FollowCompany.java
package com.jobportal.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity @Getter @Setter @NoArgsConstructor
@Table(
        name = "follow_companies",
        uniqueConstraints = @UniqueConstraint(name="uq_user_company", columnNames = {"user_id","company_id"})
)
public class FollowCompany {

    @EmbeddedId
    private FollowCompanyId id;

    @ManyToOne(fetch = FetchType.LAZY) @MapsId("userId")
    @JoinColumn(name="user_id", nullable=false, foreignKey = @ForeignKey(name="fk_follow_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY) @MapsId("companyId")
    @JoinColumn(name="company_id", nullable=false, foreignKey = @ForeignKey(name="fk_follow_company"))
    private Company company;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public FollowCompany(User user, Company company){
        this.user = user;
        this.company = company;
        this.id = new FollowCompanyId(user.getId(), company.getId());
    }
}
