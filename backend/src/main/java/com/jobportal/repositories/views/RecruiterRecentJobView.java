package com.jobportal.repositories.views;

import java.time.Instant;

public interface RecruiterRecentJobView {
    Long getId();
    String getTitle();
    Instant getCreatedAt();
    Boolean getPublished();
    Long getApplicantsCount(); // COUNT(a.id)
}
