package com.jobportal.entities;

import com.jobportal.commons.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.*;

@Entity
@Table(name = "companies")
@Getter
@Setter
public class Company extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String slug;
    private String website;

    @Column(name = "logo_url")
    private String logoUrl;
    private String description;
    private int size_min;
    private int size_max;
    private boolean verified;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CompanyAdmin> companyAdmins = new LinkedHashSet<>();

    @OneToMany(mappedBy = "company")
    private List<Job> jobs = new ArrayList<>();
}



