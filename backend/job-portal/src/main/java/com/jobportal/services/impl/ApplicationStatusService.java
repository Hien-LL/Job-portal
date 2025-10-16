package com.jobportal.services.impl;

import com.jobportal.commons.BaseService;
import com.jobportal.entities.ApplicationStatus;
import com.jobportal.repositories.ApplicationStatusRepository;
import com.jobportal.services.interfaces.ApplicationStatusServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ApplicationStatusService extends BaseService implements ApplicationStatusServiceInterface {
    private final ApplicationStatusRepository applicationStatusRepository;

    @Override
    public List<ApplicationStatus> getApplicationStatus(Map<String, String[]> params) {
        Sort sort = sortParam(params);
        Specification<ApplicationStatus> specification = specificationParam(params);
        return applicationStatusRepository.findAll(specification, sort);
    }
}
