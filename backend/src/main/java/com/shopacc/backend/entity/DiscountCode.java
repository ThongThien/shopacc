package com.shopacc.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "discount_codes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String type; // "PERCENT" or "FIXED"

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal value;

    @Column(name = "min_order_amount", precision = 18, scale = 2)
    private BigDecimal minOrderAmount;

    @Column(name = "max_usage")
    private Integer maxUsage;

    @Column(name = "used_count", nullable = false)
    private int usedCount;

    @Column(name = "is_active", nullable = false)
    @JsonProperty("isActive")
    private boolean isActive;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
