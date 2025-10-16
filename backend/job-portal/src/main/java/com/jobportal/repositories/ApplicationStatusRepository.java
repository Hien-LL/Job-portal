package com.jobportal.repositories;

import com.jobportal.entities.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApplicationStatusRepository extends JpaRepository<ApplicationStatus, Long>, JpaSpecificationExecutor<ApplicationStatus> {
    Optional<ApplicationStatus> findByCode(String code);
}
