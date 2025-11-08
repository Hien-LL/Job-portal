package com.jobportal.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "application_status_history",
        indexes = @Index(name = "idx_hist_app", columnList = "application_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationStatusHistory{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreationTimestamp
    @Column(name = "changed_at", nullable = false, updatable = false)
    private LocalDateTime changedAt;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id",
            foreignKey = @ForeignKey(name = "fk_hist_application"))
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "old_status_id",
            foreignKey = @ForeignKey(name = "fk_hist_old_status"))
    private ApplicationStatus oldStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "new_status_id",
            foreignKey = @ForeignKey(name = "fk_hist_new_status"))
    private ApplicationStatus newStatus;
}

