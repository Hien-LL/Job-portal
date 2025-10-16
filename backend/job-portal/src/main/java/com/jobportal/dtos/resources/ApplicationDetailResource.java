package com.jobportal.dtos.resources;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ApplicationDetailResource {
    private Long id;
    private LocalDateTime appliedAt;
    private String coverLetter;

    private String statusCode;
    private String statusName;

    private Long jobId;
    private Long userId;

    private ResumeResource resume; // nested
}

