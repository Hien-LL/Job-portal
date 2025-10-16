package com.jobportal.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "application_status",
        uniqueConstraints = @UniqueConstraint(name = "uk_appstatus_code", columnNames = "code"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String code; // APPLIED, REVIEWING, INTERVIEW, OFFER, REJECTED...

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "status", fetch = FetchType.LAZY)
    private List<Application> applications = new ArrayList<>();
}
