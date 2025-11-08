package com.jobportal.services.interfaces;

import com.jobportal.entities.Location;

import java.util.List;
import java.util.Map;

public interface LocationServiceInterface {
    List<Location> getAllLocations(Map<String, String[]> parameters);
}
