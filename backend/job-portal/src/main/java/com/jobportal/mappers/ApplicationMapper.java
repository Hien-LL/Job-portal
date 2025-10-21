package com.jobportal.mappers;

import com.jobportal.commons.BaseMapper;
import com.jobportal.dtos.requests.creation.ApplicationCreationRequest;
import com.jobportal.dtos.resources.ApplicationDetailResource;
import com.jobportal.dtos.resources.ApplicationListItemForCompanyResource;
import com.jobportal.dtos.resources.ApplicationResource;
import com.jobportal.entities.Application;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

@Mapper(componentModel = "spring", uses = { ApplicationStatusMapper.class })
public interface ApplicationMapper extends BaseMapper<Application, ApplicationResource, ApplicationCreationRequest, Object> {

    // Entity -> Resource
    @Override
    @Mapping(target = "jobId", source = "job.id")
    @Mapping(target = "applicationStatus", source = "status") // dùng ApplicationStatusMapper
    ApplicationResource tResource(Application entity);

    @Mapping(target = "jobId", source = "job.id")
    @Mapping(target = "applicationStatus", source = "status") // dùng ApplicationStatusMapper
    @Mapping(target = "userId", source = "user.id")
    ApplicationListItemForCompanyResource tResourceListItem(Application entity);

    // CreateRequest -> Entity
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "job", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "histories", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Application tEntity(ApplicationCreationRequest req);

    default Page<ApplicationListItemForCompanyResource> tResourceListItemPage(Page<Application> page) {
        return page.map(this::tResourceListItem);
    }

    @Mapping(target = "statusCode", source = "status.code")
    @Mapping(target = "statusName", source = "status.name")
    @Mapping(target = "jobId",     source = "job.id")
    @Mapping(target = "userId",    source = "user.id")
    @Mapping(target = "resume",    ignore = true) // set thủ công sau
    ApplicationDetailResource toDetail(Application app);
}

