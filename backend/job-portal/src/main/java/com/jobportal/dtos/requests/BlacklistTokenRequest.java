package com.jobportal.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BlacklistTokenRequest {
    @NotBlank(message = "Token khong duoc de trong")
    private String token;
}
