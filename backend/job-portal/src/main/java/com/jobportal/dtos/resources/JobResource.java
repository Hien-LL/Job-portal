// JobResource.java
package com.jobportal.dtos.resources;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class JobResource {
    private Long id;
    private String title;
    private String description;
    private Boolean Remote;
    private int salaryMax;
    private int salaryMin;
    private LocalDateTime expiresAt;
    private boolean published;
    private LocalDateTime publishedAt;
    private String seniority;
    private String slug;
    private String employmentType;
    private String currency;

    private LocationResource location;
    private CompanyResource company;
    private CategoryResource category;
    private List<BenefitResource> benefits;
}
