package com.jobportal.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "company_admins")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class CompanyAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;
}


