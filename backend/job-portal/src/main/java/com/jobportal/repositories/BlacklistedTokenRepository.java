package com.jobportal.repositories;

import com.jobportal.entities.BlacklistedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface BlacklistedTokenRepository extends JpaRepository<BlacklistedToken, Long> {
    boolean existsByToken(String blacklistedToken);
    int deleteByExpiryDateBefore(LocalDateTime currentDateTime);
}
