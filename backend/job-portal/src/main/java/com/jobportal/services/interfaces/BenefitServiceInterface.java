package com.jobportal.services.interfaces;

import com.jobportal.entities.Benefit;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.Map;

public interface BenefitServiceInterface {
    List<Benefit> getAll(Map<String, String[]> parameterMap);
}
