package com.shopacc.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderScheduler {

    private final OrderService orderService;

    @Scheduled(fixedRate = 60_000)
    public void cancelExpiredPendingOrders() {
        orderService.cancelExpiredPendingOrders();
    }
}