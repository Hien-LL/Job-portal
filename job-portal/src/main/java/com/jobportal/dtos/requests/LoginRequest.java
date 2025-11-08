package com.jobportal.dtos.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    @Email(message = "Email khong hop le")
    @NotBlank(message = "Email khong duoc de trong")
    private String email;

    @Size(min = 6, message = "Password phai co tu 6 tro len")
    private String password;
}
