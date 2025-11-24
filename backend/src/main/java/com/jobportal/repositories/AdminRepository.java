package com.jobportal.repositories;

import com.jobportal.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminRepository extends JpaRepository<User, Long> {
    // Tổng số lượng
    @Query(value = """
        SELECT 
            (SELECT COUNT(*) FROM users),
            (SELECT COUNT(*) FROM companies),
            (SELECT COUNT(*) FROM jobs),
            (SELECT COUNT(*) FROM application)
        """, nativeQuery = true)
    Object getTotals();

    @Query(value = """
        SELECT DAYOFWEEK(created_at) AS dow, COUNT(*) AS total
        FROM users
        WHERE YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)
        GROUP BY dow
        ORDER BY dow
    """, nativeQuery = true)
    List<Object[]> getUserChart();

    @Query(value = """
        SELECT DAYOFWEEK(published_at) AS dow, COUNT(*) AS total
        FROM jobs
        WHERE YEARWEEK(published_at, 1) = YEARWEEK(CURDATE(), 1)
        GROUP BY dow
        ORDER BY dow
    """, nativeQuery = true)
    List<Object[]> getJobChart();
}
