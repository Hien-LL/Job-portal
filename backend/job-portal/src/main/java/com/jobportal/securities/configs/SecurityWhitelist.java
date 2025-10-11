package com.jobportal.securities.configs;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Getter
public class SecurityWhitelist {
    @Value("${security.auth.whitelist}")
    private List<String> whitelist;
}

