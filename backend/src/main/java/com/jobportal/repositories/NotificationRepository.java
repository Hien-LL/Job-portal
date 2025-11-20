package com.jobportal.repositories;

import com.jobportal.entities.Notification;
import com.jobportal.repositories.views.NotificationAdminProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository
        extends JpaRepository<Notification, Long>, JpaSpecificationExecutor<Notification> {

    @Query(value = """
        SELECT 
            n.id          AS id,
            n.title       AS title,
            n.body        AS body,
            n.created_at  AS createdAt,
            n.read_at     AS readAt,
            u.id          AS userId,
            u.email       AS userEmail,
            u.name        AS userName
        FROM notifications n
        JOIN users u ON n.user_id = u.id
        ORDER BY n.created_at DESC
        """,
            countQuery = """
        SELECT COUNT(*)
        FROM notifications n
        """,
            nativeQuery = true)
    Page<NotificationAdminProjection> findAllForAdmin(Pageable pageable);
}
