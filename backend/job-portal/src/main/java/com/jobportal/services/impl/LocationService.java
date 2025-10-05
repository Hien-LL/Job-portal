package com.jobportal.services.impl;

import com.jobportal.commons.BaseService;
import com.jobportal.entities.Location;
import com.jobportal.mappers.LocationRepository;
import com.jobportal.services.interfaces.LocationServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class LocationService extends BaseService implements LocationServiceInterface {
    private final LocationRepository locationRepository;

    @Override
    public List<Location> getAllLocations(Map<String, String[]> parameters) {
        Sort sort = sortParam(parameters);
        Specification<Location> specification = specificationParam(parameters);

        return locationRepository.findAll(specification, sort);
    }
}
