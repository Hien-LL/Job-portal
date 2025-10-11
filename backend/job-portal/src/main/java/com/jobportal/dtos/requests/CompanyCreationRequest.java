package com.jobportal.dtos.requests;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyCreationRequest {
    private String name;
    private String slug;
    private String website;
    private String description;
    private int size_min;
    private int size_max;
}
