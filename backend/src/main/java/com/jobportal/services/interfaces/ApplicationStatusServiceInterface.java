package com.jobportal.services.interfaces;

import com.jobportal.entities.ApplicationStatus;

import java.util.List;
import java.util.Map;

public interface ApplicationStatusServiceInterface {
    List<ApplicationStatus> getApplicationStatus(Map<String, String[]> params);
}
