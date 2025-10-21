package com.jobportal.dtos.resources;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Data
public class ResumeFileResource {
    private Long id;
    private String fileUrl;
    private String fileType; // PDF/DOCX
    private LocalDateTime uploadedAt;
}
