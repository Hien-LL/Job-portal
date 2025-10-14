package com.jobportal.dtos.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class JobCreationRequest {

    @NotBlank(message = "title is required")
    private String title;

    @NotBlank(message = "description is required")
    private String description;

    // dùng wrapper để @NotNull có hiệu lực
    @NotNull(message = "isRemote is required")
    @JsonProperty("isRemote")
    private Boolean isRemote;

    @NotNull(message = "salaryMax không được để trống")
    @PositiveOrZero
    private Integer salaryMax;

    @NotNull(message = "salaryMin không được để trống")
    @PositiveOrZero
    private Integer salaryMin;

    @NotBlank(message = "seniority không được để trống")
    private String seniority; // khuyến nghị enum

    @NotBlank(message = "employmentType không được để trống")
    private String employmentType; // khuyến nghị enum

    @NotBlank(message = "currency is không được để trống")
    @Pattern(regexp = "^[A-Z]{3}$", message = "currency phải là ISO 4217 (e.g., VND, USD)")
    private String currency;

    @NotNull(message = "expiresAt không được để trống")
    @Future(message = "expiresAt phải là thời gian trong tương lai")
    private LocalDateTime expiresAt;

    @NotBlank(message = "locationCountryCode không được để trống")
    private String locationCountryCode;

    @NotNull(message = "categoryId is không được để trống")
    private Long categoryId;

    @NotNull(message = "benefitIds không được để trống")
    @Size(min = 1, message = "benefitIds phải có ít nhất một phần tử")
    private List<@NotNull Long> benefitIds;

    // cross-field validation
    @AssertTrue(message = "salaryMin phải lớn hơn hoặc bằng salaryMax")
    public boolean isSalaryRangeValid() {
        if (salaryMin == null || salaryMax == null) return true;
        return salaryMin <= salaryMax;
    }
}
