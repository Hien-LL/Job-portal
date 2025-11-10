package com.jobportal.dtos.resources;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RecruiterRecentApplicationResource {
    private Long id;
    private String jobTitle;
    private String candidateName;
    private String appliedDate; // dd/MM/yyyy
    private String status;      // pending / accepted / rejected...
}
