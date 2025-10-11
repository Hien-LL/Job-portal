package com.jobportal.dtos.requests;

import com.jobportal.dtos.resources.CategoryResource;
import com.jobportal.dtos.resources.CompanyResource;
import com.jobportal.dtos.resources.LocationResource;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class JobUpdationRequest {
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
