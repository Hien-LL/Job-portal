package com.jobportal.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Table(name = "skills")
@Entity
public class Skill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String slug;
}
