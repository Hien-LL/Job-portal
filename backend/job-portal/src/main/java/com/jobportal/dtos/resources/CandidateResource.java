package com.jobportal.dtos.resources;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder(toBuilder = true)
@Data
public class CandidateResource {
    private Long id;
    private String name;
    private String avatarUrl;
    private String headline;
    private String email;
    private String phone;
    private String address;
    private String coverLetter;
    private List<SkillResource> skills;
    private ResumeResource resume;
    private ApplicationStatusResource status;
}
