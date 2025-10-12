package com.jobportal.dtos.requests;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class JobCreationRequest {
    private String title;
    private String description;
    private boolean Remote;
    private int salaryMax;
    private int salaryMin;
    private String seniority;
    private String slug;
    private String employmentType;
    private String currency;

    private String locationCountryCode;
    private Long categoryId;
    private List<Long> benefitIds;
}
