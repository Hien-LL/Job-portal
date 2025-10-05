package com.jobportal.dtos.resources;

import lombok.Data;

@Data
public class LocationResource {
    private Long id;
    private String city;
    private String country_code;
    private String display_name;
}
