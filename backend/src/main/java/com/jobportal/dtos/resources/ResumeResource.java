package com.jobportal.dtos.resources;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.jobportal.entities.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResumeResource {
    private Long id;
    private String title;
    private String summary;
    private LocalDateTime createdAt;

    @JsonProperty("isDefault")
    private boolean isDefault;

    private List<ResumeExperienceResource> experiences;
    private List<ResumeEducationResource> educations;
    private List<ResumeFileResource> files;
}
