package com.jobportal.securities.configs;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class StaticResourceConfig implements WebMvcConfigurer {

    private final UploadConfig uploadConfig;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String baseDir = uploadConfig.getBaseDir();
        if (!baseDir.endsWith("/")) {
            baseDir += "/";
        }

        // Avatars
        registry.addResourceHandler("/avatars/**")
                .addResourceLocations("file:" + baseDir + uploadConfig.getAvatarDir() + "/");

        // Resumes
        registry.addResourceHandler("/resumes/**")
                .addResourceLocations("file:" + baseDir + uploadConfig.getResumeDir() + "/");

        // Company logos
        registry.addResourceHandler("/company-logos/**")
                .addResourceLocations("file:" + baseDir + uploadConfig.getCompanyLogoDir() + "/");

        // Background images
        registry.addResourceHandler("/company-backgrounds/**")
                .addResourceLocations("file:" + baseDir + uploadConfig.getBackgroundImageDir() + "/");
    }
}