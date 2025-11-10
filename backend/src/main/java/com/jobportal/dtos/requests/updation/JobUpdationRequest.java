package com.jobportal.dtos.requests.updation;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
public class JobUpdationRequest {
    private String title;
    private String description;

    @JsonProperty("isRemote")
    private boolean isRemote;             // <— wrapper!
    private Integer salaryMin;
    private Integer salaryMax;
    private String seniority;
    private String employmentType;
    private String currency;
    private String slug;
    private Boolean published;
    private Instant expiresAt;

    private Long categoryId;            // null: không đụng, có: đổi category
    private String locationCountryCode; // null: không đụng, có: đổi location
    private int yearsOfExperience;

    // null  : không động tới benefits
    // []    : clear hết benefits
    // [ids] : set danh sách mới
    private List<Long> benefitIds;
    private List<Long> skillIds;

    private String publishedAt;

    // (tuỳ chọn) clear fields có chủ đích
    private Set<String> fieldsToNullify; // ví dụ: ["description"]
}
