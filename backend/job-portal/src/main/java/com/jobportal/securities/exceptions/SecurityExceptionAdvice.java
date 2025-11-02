package com.jobportal.securities.exceptions;

import com.jobportal.dtos.resources.ApiResource;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice
public class SecurityExceptionAdvice {

    @ExceptionHandler({
            org.springframework.security.authorization.AuthorizationDeniedException.class,
            org.springframework.security.access.AccessDeniedException.class
    })
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResource<?> handleDenied(Exception ex) {
        return ApiResource.error("FORBIDDEN", "Truy cập bị từ chối", HttpStatus.FORBIDDEN);
    }
}
