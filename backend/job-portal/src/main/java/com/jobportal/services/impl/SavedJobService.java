package com.jobportal.services.impl;

import com.jobportal.dtos.resources.SavedJobResource;
import com.jobportal.entities.Job;
import com.jobportal.entities.SavedJob;
import com.jobportal.entities.SavedJobId;
import com.jobportal.entities.User;
import com.jobportal.mappers.SavedJobMapper;
import com.jobportal.repositories.JobRepository;
import com.jobportal.repositories.SavedJobRepository;
import com.jobportal.repositories.UserRepository;
import com.jobportal.services.interfaces.SavedJobServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
public class SavedJobService implements SavedJobServiceInterface {
    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final SavedJobMapper savedJobMapper;
    private final Logger logger = Logger.getLogger(SavedJobService.class.getName());

    @Override
    public void saveJob(Long userId, String jobSlug) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại"));

        Job job = jobRepository.findBySlug(jobSlug)
                .orElseThrow(() -> new IllegalArgumentException("Job không tồn tại"));

        SavedJobId id = new SavedJobId(user.getId(), job.getId());
        if (savedJobRepository.existsById(id)) {
            throw new IllegalArgumentException("Job đã được lưu trước đó");
        }

        // KHÔNG tự set id từng phần. Để MapsId làm.
        SavedJob sj = new SavedJob();
        sj.setUser(user); // set -> MapsId("userId") sẽ sync id.userId
        sj.setJob(job);   // set -> MapsId("jobId") sẽ sync id.jobId

        savedJobRepository.save(sj);
        logger.info("Saved job id: {} for user id: {}" + job.getId() + " user"  +user.getId());
    }

    @Override
    public void removeSavedJob(Long userId, String jobSlug) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User không tồn tại");
        }
        Job job = jobRepository.findBySlug(jobSlug)
                .orElseThrow(() -> new IllegalArgumentException("Job không tồn tại"));
        SavedJobId id = new SavedJobId(userId, job.getId());
        if (!savedJobRepository.existsById(id)) {
            throw new IllegalArgumentException("Job chưa được lưu");
        }
        savedJobRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SavedJobResource> getSavedJobsByUserId(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "savedAt"));
        return savedJobRepository.findPageByUserId(userId, pageable);
    }
}
