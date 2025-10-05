package com.jobportal.mappers;

import com.jobportal.dtos.resources.LocationResource;
import com.jobportal.entities.Location;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LocationMapper {
    LocationResource tResource(Location location);
    List<LocationResource> tResourceList(List<Location> locations);
}
