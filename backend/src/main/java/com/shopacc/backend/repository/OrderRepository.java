package com.shopacc.backend.repository;

import com.shopacc.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository
        extends JpaRepository<Order, Long> {
}