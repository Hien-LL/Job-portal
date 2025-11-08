package com.jobportal.mappers;

import com.jobportal.commons.BaseMapper;
import com.jobportal.dtos.resources.ApplicationStatusHistoryResource;
import com.jobportal.entities.ApplicationStatusHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ApplicationMapper.class, ApplicationStatusMapper.class})
public interface ApplicationStatusHistoryMapper extends BaseMapper<ApplicationStatusHistory, ApplicationStatusHistoryResource, Object, Object> {
    @Override
    @Mapping(target = "oldStatusCode", source = "oldStatus.code")
    @Mapping(target = "oldStatusName", source = "oldStatus.name")
    @Mapping(target = "newStatusCode", source = "newStatus.code")
    @Mapping(target = "newStatusName", source = "newStatus.name")
    ApplicationStatusHistoryResource tResource(ApplicationStatusHistory entity);

    @Override
    List<ApplicationStatusHistoryResource> tResourceList(List<ApplicationStatusHistory> entities);

}
