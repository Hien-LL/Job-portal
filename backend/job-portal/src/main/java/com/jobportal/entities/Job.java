package com.jobportal.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "jobs")
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private boolean isRemote;
    private int salaryMax;
    private int salaryMin;
    private LocalDateTime expiresAt;
    private boolean published;
    private LocalDateTime publishedAt;
    private String seniority;
    private String slug;
    private String employmentType;
    private String currency;
    private LocalDateTime updatedAt;

    // --- RELATIONSHIPS ---
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    @ManyToOne
    @JoinColumn(name = "location_id")
    private Location location;

    @ManyToMany
    @JoinTable(
            name = "job_benefit",
            joinColumns = @JoinColumn(name = "job_id"),
            inverseJoinColumns = @JoinColumn(name = "benefit_id")
    )
    private List<Benefit> benefits = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.publishedAt = LocalDateTime.now();
        this.expiresAt =LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
