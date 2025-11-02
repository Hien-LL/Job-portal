package com.jobportal.securities.helps;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobportal.dtos.resources.ApiResource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class RestAccessDeniedHandler implements AccessDeniedHandler {
    private final ObjectMapper om;

    @Override
    public void handle(HttpServletRequest req, HttpServletResponse res, AccessDeniedException ex) throws IOException {
        var body = ApiResource.error("403", "Truy cập bị từ chối", HttpStatus.FORBIDDEN);
        res.setStatus(HttpServletResponse.SC_FORBIDDEN);
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        om.writeValue(res.getOutputStream(), body);
    }
}

