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
@Table(name = "resume_files")
@Entity
public class ResumeFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "resume_id")
    @JsonBackReference(value = "resume-files")
    private Resume resume;

    private String fileType;
    private String fileUrl;
    private LocalDateTime uploadedAt;

    @PrePersist
    void onCreate() {
        if (uploadedAt == null) uploadedAt = LocalDateTime.now();
    }
}
