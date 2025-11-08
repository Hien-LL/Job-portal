package com.jobportal.dtos.requests.creation;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplicationUpdateStatusRequest {
    @NotBlank(message = "newStatusCode không được để trống")
    private String newStatusCode;

    private String note;
}
