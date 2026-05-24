package com.shopacc.backend.entity;

import com.shopacc.backend.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "user_balance_logs")
public class UserBalanceLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "amount_before", precision = 18, scale = 2)
    private BigDecimal amountBefore;

    @Column(name = "amount_change", precision = 18, scale = 2)
    private BigDecimal amountChange;

    @Column(name = "amount_after", precision = 18, scale = 2)
    private BigDecimal amountAfter;

    private String type;

    @Column(columnDefinition = "TEXT")
    private String description;
}