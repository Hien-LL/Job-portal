package com.jobportal.securities.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.spring5.templateresolver.SpringResourceTemplateResolver;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;

@Configuration
public class MailTemplateConfig {

    @Bean
    public SpringResourceTemplateResolver mailTemplateResolver() {
        SpringResourceTemplateResolver r = new SpringResourceTemplateResolver();
        r.setPrefix("classpath:/templates/mail/");
        r.setSuffix(".html");
        r.setTemplateMode(TemplateMode.HTML);
        r.setCharacterEncoding("UTF-8");
        r.setCacheable(true); // bật cache prod
        r.setOrder(1); // ưu tiên hơn resolver mặc định của web (nếu có)
        return r;
    }

    @Bean
    public SpringTemplateEngine mailTemplateEngine(SpringResourceTemplateResolver mailTemplateResolver) {
        SpringTemplateEngine engine = new SpringTemplateEngine();
        engine.setTemplateResolver(mailTemplateResolver);
        engine.setEnableSpringELCompiler(true);
        return engine;
    }
}

