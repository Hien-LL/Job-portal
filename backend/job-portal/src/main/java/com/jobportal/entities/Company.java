package com.jobportal.entities;

import com.jobportal.commons.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "companies")
@Data
public class Company extends BaseEntity {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String slug;
    private String website;
    private String logo_url;
    private String description;
    private int size_min;
    private int size_max;
    private boolean verified;
}
