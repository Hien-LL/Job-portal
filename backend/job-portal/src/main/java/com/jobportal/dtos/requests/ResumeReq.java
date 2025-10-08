// com/jobportal/dtos/requests/ResumeReq.java
package com.jobportal.dtos.requests;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class ResumeReq {
    private String title;
    private String summary;
    private Boolean isDefault; // null = false

    private List<ExperienceDto> experiences;
    private List<EducationDto>  educations;
    private List<FileDto>       files;

    @Data
    public static class ExperienceDto {
        private String company;
        private String position;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private Boolean current;
        private String description;
    }

    @Data
    public static class EducationDto {
        private String school;
        private String degree;
        private String major;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
    }

    @Data
    public static class FileDto {
        private String fileUrl;
        private String fileType; // PDF/DOCX
    }
}
