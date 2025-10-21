package com.jobportal.repositories;

import aj.org.objectweb.asm.commons.InstructionAdapter;
import com.jobportal.entities.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    @EntityGraph(attributePaths = "roles")
    Optional<User> findById(Long id);

    @EntityGraph(attributePaths = "roles") // load roles cùng user
    @Query("select u from User u where u.id = :id")
    Optional<User> findByIdWithRoles(@Param("id") Long id);

    boolean existsByEmail(String email);

    @Query("""
           select distinct u
           from User u
           left join fetch u.roles r
           left join fetch r.permissions p
           where u.email = :email
           """)
    Optional<User> findByEmailWithRolesAndPermissions(@Param("email") String email);
    Optional<User> findByEmail(String email);
}
