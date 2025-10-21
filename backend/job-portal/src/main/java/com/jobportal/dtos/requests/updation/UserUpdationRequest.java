package com.jobportal.dtos.requests.updation;

import lombok.Data;

@Data
public class UserUpdationRequest {
    private String name;
    private String phone;
    private String address;
    private String headline;
    private String summary;
}
