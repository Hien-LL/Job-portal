package com.jobportal.controllers;

import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.LocationResource;
import com.jobportal.entities.Location;
import com.jobportal.mappers.LocationMapper;
import com.jobportal.services.interfaces.LocationServiceInterface;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("api/locations")
public class LocationController {
    private final LocationServiceInterface locationService;
    private final LocationMapper locationMapper;

    @GetMapping("/list")
    public ResponseEntity<?> getAllLocations(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        List<Location> locations = locationService.getAllLocations(params);
        List<LocationResource> resources = locationMapper.tResourceList(locations);

        ApiResource<List<LocationResource>> resource = ApiResource.ok(resources, "Successfully retrieved locations");
        return ResponseEntity.ok(resource);
    }
}
