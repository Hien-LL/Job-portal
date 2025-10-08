package com.jobportal.mappers;

import com.jobportal.commons.BaseMapper;
import com.jobportal.dtos.resources.BenefitResource;
import com.jobportal.entities.Benefit;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BenefitMapper extends BaseMapper<Benefit, BenefitResource, Object, Object> {
}
