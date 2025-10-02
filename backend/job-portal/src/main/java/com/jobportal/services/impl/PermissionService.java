package com.jobportal.services.impl;

import com.jobportal.commons.BaseService;
import com.jobportal.dtos.requests.PermissionCreationRequest;
import com.jobportal.dtos.requests.PermissionUpdationRequest;
import com.jobportal.dtos.resources.PermissionResource;
import com.jobportal.entities.Permission;
import com.jobportal.mappers.PermissionMapper;
import com.jobportal.repositories.PermissionRepository;
import com.jobportal.securities.exceptions.DuplicateResourceException;
import com.jobportal.services.interfaces.PermissionServiceInterface;
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
public class PermissionService extends BaseService implements PermissionServiceInterface {
    private final PermissionRepository permissionRepository;
    private final PermissionMapper permissionMapper;

    @Override
    public Permission create(PermissionCreationRequest request) {
        if (permissionRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Permission đã tồn tại");
        }

        Permission payload = permissionMapper.tEntity(request);
        return permissionRepository.save(payload);
    }

    @Override
    public List<Permission> getAll(Map<String, String[]> parameters) {
        Sort sort = sortParam(parameters);
        Specification<Permission> specification = specificationParam(parameters);

        return permissionRepository.findAll(specification ,sort);
    }

    @Override
    public Permission update(Long id, PermissionUpdationRequest request) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Quyền người dùng không tồn tại với id: " + id));

        if (request.getName() != null) {
            permission.setName(request.getName());
        }

        if (request.getDescription() != null) {
            permission.setDescription(request.getDescription());
        }

        return permissionRepository.save(permission);
    }

    @Override
    public Page<Permission> paginate(Map<String, String[]> parameters) {
        int page = parameters.containsKey("page") ? Integer.parseInt(parameters.get("page")[0]) : 1;
        int perPage = parameters.containsKey("perPage") ? Integer.parseInt(parameters.get("perPage")[0]) : 10;
        Sort sort = sortParam(parameters);
        Specification<Permission> specification = specificationParam(parameters);
        Pageable pageable = PageRequest.of(page - 1, perPage, sort);

        return permissionRepository.findAll(specification ,pageable);
    }

    @Override
    public void delete(Long id) {
        permissionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Quyền người dùng không tồn tại với id: " + id));
        permissionRepository.deleteById(id);
    }

    @Override
    public PermissionResource findById(Long id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Quyền người dùng không tồn tại với id: " + id));
        return permissionMapper.tResource(permission);
    }
}
