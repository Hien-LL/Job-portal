package com.jobportal.entities;

import com.jobportal.commons.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "blacklisted_tokens")
public class BlacklistedToken extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "token", columnDefinition = "LONGTEXT", nullable = false)
    private String token;

    @Column(name = "user_id")
    private long userId;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;
}
