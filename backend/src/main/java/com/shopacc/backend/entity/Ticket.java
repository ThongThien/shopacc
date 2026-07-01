package com.shopacc.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String category; // "ACCOUNT" or "DEPOSIT"

    @Column(nullable = false)
    private String status; // "OPEN" or "CLOSED"

    @Column(name = "last_reply_by_admin", nullable = false)
    private boolean lastReplyByAdmin;

    @Column(columnDefinition = "TEXT")
    private String messages; // JSON array of {userId, username, isAdmin, text, createdAt}

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
