package com.jobportal.dtos.resources;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class JobListItemResource {
    private Long id;
    private String title;
    private String description;
    @JsonProperty("isRemote")
    private boolean isRemote;
    private int salaryMax;
    private int salaryMin;
    private String seniority;
    private boolean published;
    private LocalDateTime publishedAt;
    private String slug;

    private LocationListItemResource location;
    private CompanyListItemResource company;
    private CategoryResource category;
    private List<BenefitListItemResource> benefits;

    public boolean getIsRemote() { return isRemote; }
}
