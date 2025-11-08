package com.jobportal.securities.configs;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // Avatars
        registry.addResourceHandler("/avatars/**")
                .addResourceLocations("file:uploads/avatars/");

        // Resumes
        registry.addResourceHandler("/resumes/**")
                .addResourceLocations("file:uploads/resumes/");

        // Company logos
        registry.addResourceHandler("/company-logos/**")
                .addResourceLocations("file:uploads/company-logos/");

        // Background images
        registry.addResourceHandler("/company-backgrounds/**")
                .addResourceLocations("file:uploads/company-backgrounds/");
    }
}
