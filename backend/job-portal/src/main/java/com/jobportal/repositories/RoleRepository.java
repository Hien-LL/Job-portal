package com.jobportal.repositories;

import com.jobportal.entities.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long>, JpaSpecificationExecutor<Role> {
    @EntityGraph(attributePaths = "permissions")
    Optional<Role> findById(Long id);

    Optional<Role> findByName(String name);

    @EntityGraph(attributePaths = {"permissions"})
    Page<Role> findAll(Specification<Role> spec, Pageable pageable);

    boolean existsByName(String name);
}