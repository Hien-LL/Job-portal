package com.jobportal.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "saved_jobs",
        uniqueConstraints = @UniqueConstraint(name = "uk_saved_job", columnNames = {"user_id", "job_id"})
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class SavedJob {

    @EmbeddedId
    private SavedJobId id = new SavedJobId(); // quan trọng: để MapsId set giá trị

    @ManyToOne(fetch = FetchType.LAZY) @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_saved_job_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY) @MapsId("jobId")
    @JoinColumn(name = "job_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_saved_job_job"))
    private Job job;

    @Column(name = "saved_at", nullable = false)
    private LocalDateTime savedAt;

    @PrePersist
    public void prePersist() {
        if (savedAt == null) savedAt = LocalDateTime.now();
    }
}
