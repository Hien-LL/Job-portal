package com.jobportal.dtos.resources;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ResumeEducationResource {
    private Long id;
    private String degree;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String major;
    private String school;
}
