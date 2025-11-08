package com.jobportal.dtos.resources;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ResumeExperienceResource {
    private Long id;
    private String company;
    private boolean current;
    private String description;
    private String position;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
