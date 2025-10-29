package com.jobportal.dtos.resources;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CompanyResource {
    private Long id;
    private String name;
    private String slug;
    private String website;
    private String logoUrl;
    private String description;
    private int size_min;
    private int size_max;
    private boolean verified;
    private int followerCount;
}
