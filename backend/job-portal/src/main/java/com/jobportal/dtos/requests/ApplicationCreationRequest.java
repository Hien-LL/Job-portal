package com.jobportal.dtos.requests;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplicationCreationRequest {
    @NotNull(message = "resumeId không được để trống")
    @JsonAlias({"resumeId", "resume_id", "resumeID"})
    private Long resumeId;

    @NotBlank(message = "coverLetter không được để trống")
    @JsonAlias({"coverLetter", "cover_letter"})
    private String coverLetter;
}
