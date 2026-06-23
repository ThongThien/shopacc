package com.shopacc.backend.entity;

import java.math.BigDecimal;

import com.shopacc.backend.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payment_webhook_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentWebhookLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String provider;

    private String referenceCode;

    private String accountNumber;

    private String transferType;

    @Column(precision = 18, scale = 2)
    private BigDecimal transferAmount;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String rawBody;

    private String status;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;
}
