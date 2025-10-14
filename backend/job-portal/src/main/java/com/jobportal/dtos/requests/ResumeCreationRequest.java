package com.jobportal.dtos.requests;

import com.jobportal.entities.ResumeEducation;
import com.jobportal.entities.ResumeExperience;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Setter
@Getter
public class ResumeCreationRequest {
    @NotBlank(message = "title không được để trống")
    private String title;

    @NotBlank(message = "summary không được để trống")
    private String summary;

    @NotNull(message = "isDefault không được để trống")
    private Boolean isDefault;

    private List<ResumeExperience> experiences;
    private List<ResumeEducation>  educations;
}
