package com.jobportal.dtos.requests.updation;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.jobportal.dtos.resources.ResumeEducationResource;
import com.jobportal.dtos.resources.ResumeExperienceResource;
import lombok.Data;

import java.util.List;

@Data
public class ResumeUpdationRequest {
    private String title;
    private String summary;

    @JsonProperty("isDefault")
    private boolean isDefault;

    private List<ResumeExperienceUpdateRequest> experiences;
    private List<ResumeEducationUpdateRequest> educations;
}
