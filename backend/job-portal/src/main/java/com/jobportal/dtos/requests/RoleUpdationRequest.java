package com.jobportal.dtos.requests;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoleUpdationRequest {
    @NotBlank(message = "Tên nhóm thành viên không được để trống")
    private String name;

    @NotNull(message = "Trang thái không được để trống")
    @Min(value = 0, message = "Giá trị trạng thành phải lớn hơn hoặc bằng 0")
    @Max(value = 2, message = "Giá trị trạng thành phải lớn hơn hoặc bằng 2")
    private Integer priority;
}