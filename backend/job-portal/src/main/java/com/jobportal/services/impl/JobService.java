package com.jobportal.services.impl;

import com.jobportal.mappers.JobMapper;
import com.jobportal.repositories.JobRepository;
import com.jobportal.services.interfaces.JobServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JobService implements JobServiceInterface {
    private final JobRepository jobRepository;
    private final JobMapper jobMapper;
}
