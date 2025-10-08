package com.jobportal.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "benefits")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Benefit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;
}
