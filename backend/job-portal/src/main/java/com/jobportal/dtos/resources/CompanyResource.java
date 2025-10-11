package com.jobportal.dtos.resources;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyResource {
    private Long id;
    private String name;
    private String slug;
    private String website;
    private String logo_url;
    private String description;
    private int size_min;
    private int size_max;
    private boolean verified;
}
