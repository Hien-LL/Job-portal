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
    private String baseDir;              // thư mục gốc upload (local: uploads/, docker: /app/uploads)
    private String avatarDir;            // thư mục ảnh đại diện
    private String companyLogoDir;       // thư mục logo công ty
    private String backgroundImageDir;   // thư mục ảnh nền công ty
    private String resumeDir;            // thư mục lưu CV
    private String allowedImageExt;      // đuôi ảnh hợp lệ
    private String allowedDocExt;        // đuôi file tài liệu hợp lệ
    private String maxSize;              // dung lượng tối đa (ví dụ 10MB)
}
