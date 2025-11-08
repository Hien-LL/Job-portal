package com.jobportal.controllers;

import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.BenefitResource;
import com.jobportal.entities.Benefit;
import com.jobportal.mappers.BenefitMapper;
import com.jobportal.services.interfaces.BenefitServiceInterface;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/benefits")
@RequiredArgsConstructor
public class BenefitController {
    private final BenefitServiceInterface benefitService;
    private final BenefitMapper benefitMapper;

    @GetMapping("/list")
    ResponseEntity<?> getAll(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        List<Benefit> benefits = benefitService.getAll(params);
        List<BenefitResource> resources = benefitMapper.tResourceList(benefits);

        ApiResource<List<BenefitResource>> resource = ApiResource.ok(resources, "Success");
        return ResponseEntity.ok(resource);
    }
}
