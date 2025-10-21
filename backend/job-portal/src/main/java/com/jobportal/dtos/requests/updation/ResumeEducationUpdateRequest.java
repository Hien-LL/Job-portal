package com.jobportal.dtos.requests.updation;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ResumeEducationUpdateRequest {
    private Long id;
    private String degree;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String major;
    private String school;
}
