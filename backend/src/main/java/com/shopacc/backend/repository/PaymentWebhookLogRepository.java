package com.shopacc.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.shopacc.backend.entity.PaymentWebhookLog;

public interface PaymentWebhookLogRepository extends JpaRepository<PaymentWebhookLog, Long> {

}
