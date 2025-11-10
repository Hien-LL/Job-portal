package com.jobportal.repositories.views;

public interface ApplicationStatsView {
    Long getTotal();
    Long getPending();
    Long getAccepted();
    Long getRejected();
    Long getViewed();
}
