package com.shopacc.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "service_id", nullable = false)
    private Long serviceId;

    @Column(name = "service_title")
    private String serviceTitle;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal price;

    @Column(name = "account_name", columnDefinition = "TEXT")
    private String accountName; // AES encrypted

    @Column(columnDefinition = "TEXT")
    private String password; // AES encrypted

    private String server;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(nullable = false)
    private String status; // PENDING, PROCESSING, COMPLETED, CANCELLED

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
