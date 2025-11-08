package com.jobportal.dtos.requests.updation;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyUpdationRequest {
    private String name;
    private String website;
    private String description;
    private int size_min;
    private int size_max;
}
