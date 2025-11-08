package com.jobportal.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "resume_educations")
@Entity
@EqualsAndHashCode(of = "id")
public class ResumeEducation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "resume_id")
    @JsonBackReference(value = "resume-educations")
    private Resume resume;

    private String degree;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String major;
    private String school;
}
