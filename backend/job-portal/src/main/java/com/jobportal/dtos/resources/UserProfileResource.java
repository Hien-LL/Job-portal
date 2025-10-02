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
    private String email;
    private String name;
    private String phone;
    private String address;
}
