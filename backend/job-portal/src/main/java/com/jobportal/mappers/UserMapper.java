package com.jobportal.mappers;

import com.jobportal.dtos.requests.RegisterRequest;
import com.jobportal.dtos.requests.UserUpdationRequest;
import com.jobportal.dtos.resources.*;
import com.jobportal.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring", uses = {RoleMapper.class, PermissionMapper.class})
public interface UserMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "roles", ignore = true)
    User tEntity(RegisterRequest req);
    UserDetailsResource tResourceDetails(User user);
    UserProfileResource tProfileResource(User user);
    UserResource tResource(User user);
    AuthResource tAuthResource(User user);
    RegisterResource tRegisterResource(User user);

    @Mapping(target = "name",  source = "name")
    @Mapping(target = "phone", source = "phone")
    @Mapping(target = "address", source = "address")
    void updateUserFromRequest(UserUpdationRequest req, @MappingTarget User user);

    List<UserResource> tResourceList(List<User> users);

    default Page<UserResource> tResourcePage(Page<User> users) {
        return users.map(this::tResource);
    }
}
