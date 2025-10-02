package com.jobportal.dtos.requests;

import lombok.Getter;

@Getter
public class UserUpdationRequest {
    private String name;
    private String phone;
    private String address;
}
