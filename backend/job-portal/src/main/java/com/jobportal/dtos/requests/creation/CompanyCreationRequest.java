package com.jobportal.dtos.requests.creation;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyCreationRequest {
    private String name;
    private String website;
    private String description;
    private int size_min;
    private int size_max;
}
