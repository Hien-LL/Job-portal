package com.jobportal.dtos.resources;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RecruiterRecentJobResource {
    private Long id;
    private String title;
    private String postedDate;     // dd/MM/yyyy
    private String status;         // published | draft
    private int applicantsCount;
}
