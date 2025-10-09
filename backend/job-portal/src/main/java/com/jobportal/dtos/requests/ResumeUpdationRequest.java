package com.jobportal.dtos.requests;

import com.jobportal.entities.ResumeEducation;
import com.jobportal.entities.ResumeExperience;
import lombok.Getter;
import java.util.List;

@Getter
public class ResumeUpdationRequest {
    private String title;
    private String summary;
    private Boolean isDefault; // null = false

    private List<ResumeExperience> experiences;
    private List<ResumeEducation>  educations;
}
