package com.jobportal.controllers;

import com.jobportal.dtos.resources.ApiResource;
import com.jobportal.dtos.resources.SkillResource;
import com.jobportal.entities.Skill;
import com.jobportal.mappers.SkillMapper;
import com.jobportal.services.interfaces.SkillServiceInterface;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("api/skills")
public class SkillController {
    private final SkillMapper skillMapper;
    private final SkillServiceInterface skillService;

    @GetMapping("/list")
    public ResponseEntity<?> getAllSkills(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        List<Skill> skills = skillService.getAllSkills(params);
        List<SkillResource> skillResources = skillMapper.tResourceList(skills);

        ApiResource<List<SkillResource>> resource = ApiResource.ok(skillResources, "Success");
        return ResponseEntity.ok(resource);
    }
}
