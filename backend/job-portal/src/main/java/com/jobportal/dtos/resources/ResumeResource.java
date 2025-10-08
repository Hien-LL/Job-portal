package com.jobportal.dtos.resources;

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
    private boolean isDefault;

    private List<ResumeExperience> experiences;
    private List<ResumeEducation> educations;
    private List<ResumeFile> files;

    // Summary (không children)
    public static ResumeResource ofSummary(Resume r) {
        ResumeResource dto = new ResumeResource();
        dto.setId(r.getId());
        dto.setTitle(r.getTitle());
        dto.setSummary(r.getSummary());
        dto.setDefault(r.isDefault());
        return dto;
    }

    // Detail (đã load children trong TX)
    public static ResumeResource ofDetail(Resume r) {
        ResumeResource dto = new ResumeResource();
        dto.setId(r.getId());
        dto.setTitle(r.getTitle());
        dto.setSummary(r.getSummary());
        dto.setDefault(r.isDefault());
        dto.setExperiences(r.getExperiences().stream().toList());
        dto.setEducations(r.getEducations().stream().toList());
        dto.setFiles(r.getFiles().stream().toList());
        return dto;
    }
}
