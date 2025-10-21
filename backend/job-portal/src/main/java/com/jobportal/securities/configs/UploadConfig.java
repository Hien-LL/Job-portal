package com.jobportal.securities.configs;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "upload")
public class UploadConfig {
    private String baseDir;
    private String avatarDir;
    private String companyLogoDir;
    private String resumeDir;
    private String allowedImageExt;
    private String allowedDocExt;
    private String maxSize;
}
