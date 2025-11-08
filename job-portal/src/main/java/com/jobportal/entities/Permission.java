package com.jobportal.entities;

import com.jobportal.commons.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "permissions")
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class Permission extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    @ManyToMany(mappedBy = "permissions")
    private Set<Role> roles;
}
