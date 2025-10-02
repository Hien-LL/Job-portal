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
@Table(name = "refresh_tokens")
public class RefreshToken extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "refresh_token", columnDefinition = "TEXT", nullable = false, unique = true, length = 500) // Dòng này phải có 'length = 500'
    private String refreshToken;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    @Column(name = "user_id")
    private Long userId;

    @OneToOne
    @JoinColumn(name ="user_id", referencedColumnName = "id", insertable = false, updatable = false)
    private User user;
}
