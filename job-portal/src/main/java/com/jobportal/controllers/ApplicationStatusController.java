package com.jobportal.controllers;

import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.ApplicationStatusResource;
import com.jobportal.entities.ApplicationStatus;
import com.jobportal.mappers.ApplicationStatusMapper;
import com.jobportal.services.interfaces.ApplicationStatusServiceInterface;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/application-statuses")
public class ApplicationStatusController {
    private final ApplicationStatusServiceInterface applicationStatusService;
    private final ApplicationStatusMapper applicationStatusMapper;

    @GetMapping
    public ResponseEntity<?> getListApplicationStatus(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        List<ApplicationStatus> statuses = applicationStatusService.getApplicationStatus(params);
        List<ApplicationStatusResource> resources = applicationStatusMapper.tResourceList(statuses);

        ApiResource<List<ApplicationStatusResource>> response = ApiResource.ok(resources, "Lấy danh sách trạng thái ứng tuyển thành công");
        return ResponseEntity.ok(response);
    }
}
