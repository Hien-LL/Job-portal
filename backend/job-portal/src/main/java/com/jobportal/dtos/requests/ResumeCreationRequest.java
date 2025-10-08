package com.jobportal.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ResumeCreationRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;
    @NotNull(message = "Tóm tắt không được để trống")
    private String summary;
    private boolean is_default;

    @Data
    public static class ResumeExperienceCreation {
        private String company;
        private boolean current;
        private String description;
        private String position;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
    }

    @Data
    public static class ResumeEducationCreation {
        private String school;
        private String degree;
        private String fieldOfStudy;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private String description;
    }

    @Data
    public static class ResumeFileCreation {
        private String fileName;
        private String fileType;
        private String fileUrl;
    }
}
