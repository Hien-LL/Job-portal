package com.jobportal.services.impl;

import com.jobportal.commons.BaseService;
import com.jobportal.entities.Skill;
import com.jobportal.repositories.SkillRepository;
import com.jobportal.services.interfaces.SkillServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class SkillService extends BaseService implements SkillServiceInterface {
    private final SkillRepository skillRepository;

    @Override
    public List<Skill> getAllSkills(Map<String, String[]> params) {
        Sort sort = sortParam(params);
        Specification<Skill> specification = specificationParam(params);
        return skillRepository.findAll(specification, sort);
    }
}
