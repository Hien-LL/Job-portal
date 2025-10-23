package com.jobportal.dtos.resources;

import lombok.Data;

@Data
public class CompanyListItemResource {
    private Long id;
    private String name;
    private String slug;
    private String logoUrl;

    private boolean verified;
}
