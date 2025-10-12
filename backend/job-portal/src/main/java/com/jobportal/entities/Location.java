package com.jobportal.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Builder
@RequiredArgsConstructor
@Entity
@Table(name = "locations")
@Data
@AllArgsConstructor
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String city;
    private String countryCode;
    private String displayName;

    @OneToMany(mappedBy = "location")
    private List<Job> jobs = new ArrayList<>();
}
