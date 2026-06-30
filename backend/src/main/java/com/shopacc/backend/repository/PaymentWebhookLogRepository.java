package com.shopacc.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.shopacc.backend.entity.PaymentWebhookLog;
import java.util.List;

public interface PaymentWebhookLogRepository extends JpaRepository<PaymentWebhookLog, Long> {
    List<PaymentWebhookLog> findAllByOrderByCreatedAtDesc();
}
