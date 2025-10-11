package com.jobportal.dtos.resources;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class JobResource {
    private Long id;
    private String title;
    private String description;
    private boolean is_remote;
    private int salary_max;
    private int salary_min;
    private LocalDateTime expires_at;
    private boolean published;
    private LocalDateTime published_at;
    private String seniority;
    private String slug;
    private String employment_type;
    private String currency;

    private LocationResource location;
    private CompanyResource company;
    private CategoryResource category;
}
