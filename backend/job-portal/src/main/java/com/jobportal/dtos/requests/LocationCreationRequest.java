package com.jobportal.dtos.requests;

import jakarta.validation.constraints.NotBlank;

public class LocationCreationRequest {
    @NotBlank(message = "city không được để trống")
    private String city;

    @NotBlank(message = "countryCode không được để trống")
    private String countryCode;
    private String displayName;
}
