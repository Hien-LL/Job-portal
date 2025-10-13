package com.jobportal.dtos.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class JobCreationRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "remote is required")
    @JsonProperty("isRemote")
    private boolean isRemote;

    @NotNull(message = "salaryMax is required")
    private int salaryMax;

    @NotNull(message = "salaryMin is required")
    private int salaryMin;

    @NotBlank(message = "seniority is required")
    private String seniority;

    @NotBlank(message = "employmentType is required")
    private String employmentType;

    @NotBlank(message = "currency is required")
    private String currency;

    @NotNull(message = "expiresAt is required")
    private LocalDateTime expiresAt;


    @NotBlank(message = "slug is required")
    private String locationCountryCode;

    @NotNull(message = "categoryId is required")
    private Long categoryId;

    @NotNull(message = "benefitIds is required")
    private List<Long> benefitIds;
}
