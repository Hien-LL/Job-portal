package com.jobportal.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.jobportal.commons.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.util.LinkedHashSet;
import java.util.Set;

import static jakarta.persistence.CascadeType.ALL;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "resumes")
public class Resume extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 150, nullable = false)
    private String title;

    @Lob
    private String summary;

    @Column(name = "is_default")
    private boolean isDefault;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    // experiences
    @OneToMany(mappedBy = "resume", cascade = ALL, orphanRemoval = true)
    @Fetch(FetchMode.SUBSELECT)
    @BatchSize(size = 50)
    @OrderBy("startDate DESC")
    @JsonManagedReference(value = "resume-experiences")
    private Set<ResumeExperience> experiences = new LinkedHashSet<>();

    // educations
    @OneToMany(mappedBy = "resume", cascade = ALL, orphanRemoval = true)
    @Fetch(FetchMode.SUBSELECT)
    @BatchSize(size = 50)
    @OrderBy("startDate DESC")
    @JsonManagedReference(value = "resume-educations")
    private Set<ResumeEducation> educations = new LinkedHashSet<>();

    // files
    @OneToMany(mappedBy = "resume", cascade = ALL, orphanRemoval = true)
    @Fetch(FetchMode.SUBSELECT)
    @BatchSize(size = 50)
    @OrderBy("uploadedAt DESC")
    @JsonManagedReference(value = "resume-files")
    private Set<ResumeFile> files = new LinkedHashSet<>();

    public boolean isDefault() {
        return this.isDefault;
    }
    // nếu có setter:
    public void setDefault(boolean val) {
        this.isDefault = val;
    }
}
