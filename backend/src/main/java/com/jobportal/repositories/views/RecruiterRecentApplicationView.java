package com.jobportal.repositories.views;

import java.time.Instant;

public interface RecruiterRecentApplicationView {
    Long getId();
    String getJobTitle();
    String getCandidateName();
    Instant getCreatedAt();
    String getStatusCode();
}
