package com.jobportal.dtos.resources;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResource {
    private Long id;
    private String email;
    private String name;
    private String phone;
    private String address;
    private String headline;
    private String summary;
    private String avatarUrl;
}
