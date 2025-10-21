package com.jobportal.dtos.requests.updation;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class RoleUpdationRequest {
    private String name;

    @Min(value = 0, message = "Giá trị trạng thành phải lớn hơn hoặc bằng 0")
    @Max(value = 2, message = "Giá trị trạng thành phải lớn hơn hoặc bằng 2")
    private Integer priority;
}