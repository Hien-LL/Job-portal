package com.jobportal.services.interfaces;

import com.jobportal.dtos.requests.UserUpdationRequest;
import com.jobportal.dtos.resources.UserDetailsResource;
import com.jobportal.dtos.resources.UserProfileResource;
import com.jobportal.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface UserServiceInterface {
    UserProfileResource update(Long id, UserUpdationRequest user);
    void delete(Long id);
    Page<User> paginate(Map<String, String[]> parameters);
    List<User> getAll(Map<String, String[]> parameters);
    UserDetailsResource getById(Long id);
    String uploadAvatar(Long id, MultipartFile file);
}
