package com.jobportal.services.interfaces;

import com.jobportal.dtos.resources.AdminStatsResource;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

public interface AdminServiceInterface {
    AdminStatsResource getStats();

    @Transactional
    void deleteJob(Long id);
}
