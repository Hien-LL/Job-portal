package com.jobportal.services.impl;

import com.jobportal.commons.BaseService;
import com.jobportal.entities.Benefit;
import com.jobportal.repositories.BenefitRepository;
import com.jobportal.services.interfaces.BenefitServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class BenefitService extends BaseService implements BenefitServiceInterface {
    private final BenefitRepository benefitRepository;

    @Override
    public List<Benefit> getAll(Map<String, String[]> parameterMap) {
        Sort sort = sortParam(parameterMap);
        Specification<Benefit> specification = specificationParam(parameterMap);
        return benefitRepository.findAll(specification, sort);
    }
}
