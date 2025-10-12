package com.jobportal.dtos.resources;

import lombok.Data;

@Data
public class LocationResource {
    private Long id;
    private String city;
    private String countryCode;
    private String displayName;
}
