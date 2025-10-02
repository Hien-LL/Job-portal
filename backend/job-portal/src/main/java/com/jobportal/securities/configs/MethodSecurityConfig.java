package com.jobportal.securities.configs;

import com.jobportal.securities.details.CustomPermissionEvaluator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@Configuration
@EnableMethodSecurity // chỉ cần xuất hiện 1 lần trong app
@RequiredArgsConstructor
public class MethodSecurityConfig {

    private final CustomPermissionEvaluator customPermissionEvaluator;

    // TÊN BEAN PHẢI LÀ "methodSecurityExpressionHandler"
    @Bean(name = "methodSecurityExpressionHandler")
    public MethodSecurityExpressionHandler methodSecurityExpressionHandler() {
        DefaultMethodSecurityExpressionHandler h = new DefaultMethodSecurityExpressionHandler();
        h.setPermissionEvaluator(customPermissionEvaluator);
        return h;
    }
}