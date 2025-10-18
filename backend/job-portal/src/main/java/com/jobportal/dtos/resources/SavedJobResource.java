package com.jobportal.dtos.resources;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedJobResource {
    private Long jobId;
    private String title;
    private String slug;
    private String companyName;
    private String companyLogoUrl;

    private String location;
    private boolean remote;

    private int salaryMin;
    private int salaryMax;

    private String currency;
    private String employmentType;

    private LocalDateTime savedAt;
    private LocalDateTime expiresAt;

    private boolean expired;
}

