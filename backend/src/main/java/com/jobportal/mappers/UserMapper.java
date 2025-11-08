package com.jobportal.mappers;

import com.jobportal.commons.BaseMapper;
import com.jobportal.dtos.requests.RegisterRequest;
import com.jobportal.dtos.requests.updation.UserUpdationRequest;
import com.jobportal.dtos.resources.*;
import com.jobportal.entities.User;
import org.mapstruct.Mapper;
import org.springframework.data.domain.Page;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring", uses = {RoleMapper.class, PermissionMapper.class})
public interface UserMapper extends BaseMapper<User, UserResource, RegisterRequest, UserUpdationRequest> {
    UserDetailsResource tResourceDetails(User user);
    UserProfileResource tProfileResource(User user);
    AuthResource tAuthResource(User user);
    RegisterResource tRegisterResource(User user);
    List<UserResource> tResourceList(List<User> users);
    default Page<UserResource> tResourcePage(Page<User> users) {
        return users.map(this::tResource);
    }

    @Mapping(target = "skills", ignore = true)
    @Mapping(target = "resume", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "coverLetter", ignore = true)
    CandidateResource tCandidateResource(User user);
}
