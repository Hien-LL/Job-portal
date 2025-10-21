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
@Entity
@Table(name = "resume_experiences")
@EqualsAndHashCode(of = "id")
public class ResumeExperience {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "resume_id")
    @JsonBackReference(value = "resume-experiences")
    private Resume resume;

    private String company;
    private boolean current;
    @Lob
    private String description;
    private String position;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
