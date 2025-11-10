package com.jobportal.dtos.resources;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApplicationStatisticsResource {
    private int total;
    private int pending;
    private int accepted;
    private int rejected;
    private int viewed;
}
