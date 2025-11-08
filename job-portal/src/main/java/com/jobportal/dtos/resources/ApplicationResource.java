package com.jobportal.dtos.resources;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class ApplicationResource {
    private Long id;
    private ApplicationStatusResource applicationStatus;
    private LocalDateTime appliedAt;
    private String coverLetter;
    private Long resumeId;
    private Long jobId;
    private String jobTitle;
}
