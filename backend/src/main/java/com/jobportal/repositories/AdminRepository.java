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

    // User chart: tháng -> số lượng
    @Query(value = """
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS total
        FROM users
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY month
        ORDER BY month
    """, nativeQuery = true)
    List<Object[]> getUserChart();

    // Job chart: tháng -> số lượng
    @Query(value = """
        SELECT DATE_FORMAT(published_at, '%Y-%m') AS month, COUNT(*) AS total
        FROM jobs
        WHERE published_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY month
        ORDER BY month
    """, nativeQuery = true)
    List<Object[]> getJobChart();
}
