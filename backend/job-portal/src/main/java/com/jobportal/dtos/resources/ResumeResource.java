package com.jobportal.dtos.resources;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.jobportal.entities.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResumeResource {
    private Long id;
    private String title;
    private String summary;

    @JsonProperty("isDefault")
    private boolean isDefault;

    private List<ResumeExperienceResource> experiences;
    private List<ResumeEducationResource> educations;
    private List<ResumeFileResource> files;
}
