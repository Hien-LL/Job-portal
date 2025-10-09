package com.jobportal.dtos.resources;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ResumeFileResource {
    private Long id;
    private String fileUrl;
    private String fileType; // PDF/DOCX
}
