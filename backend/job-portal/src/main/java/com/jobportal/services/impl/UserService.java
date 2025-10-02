package com.jobportal.services.impl;

import com.jobportal.commons.BaseService;
import com.jobportal.dtos.requests.UserUpdationRequest;
import com.jobportal.dtos.resources.UserDetailsResource;
import com.jobportal.dtos.resources.UserProfileResource;
import com.jobportal.entities.User;
import com.jobportal.mappers.UserMapper;
import com.jobportal.repositories.UserRepository;
import com.jobportal.services.interfaces.UserServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class UserService extends BaseService implements UserServiceInterface {
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public UserProfileResource update(Long id, UserUpdationRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found"));
        userMapper.updateUserFromRequest(request, user);
        userRepository.save(user);
        return userMapper.tProfileResource(user);
    }

    @Override
    public void delete(Long id) {
        userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Nguời dùng không tồn tại với id: " + id));
        userRepository.deleteById(id);
    }

    @Override
    public Page<User> paginate(Map<String, String[]> parameters) {
        int page = parameters.containsKey("page") ? Integer.parseInt(parameters.get("page")[0]) : 1;
        int perPage = parameters.containsKey("perPage") ? Integer.parseInt(parameters.get("perPage")[0]) : 20;
        Sort sort = sortParam(parameters);
        Specification<User> specification = specificationParam(parameters);

        Pageable pageable = PageRequest.of(page - 1, perPage, sort);
        return userRepository.findAll(specification ,pageable);
    }

    @Override
    public List<User> getAll(Map<String, String[]> parameters) {
        Sort sort = sortParam(parameters);
        Specification<User> specification = specificationParam(parameters);
        return userRepository.findAll(specification ,sort);
    }

    @Override
    public UserDetailsResource getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));
        return userMapper.tResourceDetails(user);
    }
}
