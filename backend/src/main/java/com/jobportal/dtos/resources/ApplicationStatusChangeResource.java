package com.jobportal.dtos.resources;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ApplicationStatusChangeResource {
    private Long applicationId;
    private String oldStatusCode;
    private String oldStatusName;
    private String newStatusCode;
    private String newStatusName;
    private String note;
    private LocalDateTime changedAt;
}

