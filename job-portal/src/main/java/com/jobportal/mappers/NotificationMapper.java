package com.jobportal.mappers;

import com.jobportal.commons.BaseMapper;
import com.jobportal.dtos.requests.NotificationRequest;
import com.jobportal.dtos.resources.NotificationResource;
import com.jobportal.entities.Notification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper extends BaseMapper<Notification, NotificationResource, NotificationRequest, Object> {
}
