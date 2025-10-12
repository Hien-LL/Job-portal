package com.jobportal.dtos.requests;

import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
public class JobUpdationRequest {
    private String title;
    private String description;
    private Boolean remote;             // <— wrapper!
    private Integer salaryMin;
    private Integer salaryMax;
    private String seniority;
    private String employmentType;
    private String currency;
    private String slug;
    private Boolean published;

    private Long categoryId;            // null: không đụng, có: đổi category
    private String locationCountryCode; // null: không đụng, có: đổi location

    // null  : không động tới benefits
    // []    : clear hết benefits
    // [ids] : set danh sách mới
    private List<Long> benefitIds;

    private String expiresAt;
    private String publishedAt;

    // (tuỳ chọn) clear fields có chủ đích
    private Set<String> fieldsToNullify; // ví dụ: ["description"]
}
