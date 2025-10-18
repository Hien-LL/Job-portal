package com.jobportal.services.interfaces;

import com.jobportal.dtos.resources.SavedJobResource;
import org.springframework.data.domain.Page;

import java.util.List;

public interface SavedJobServiceInterface {
    void saveJob(Long userId, String jobSlug);
    void removeSavedJob(Long userId, String jobSlug);
    Page<SavedJobResource> getSavedJobsByUserId(Long userId, int page, int size);
}
