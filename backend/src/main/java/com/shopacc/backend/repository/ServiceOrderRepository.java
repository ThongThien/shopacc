package com.shopacc.backend.repository;

import com.shopacc.backend.entity.ServiceOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceOrderRepository extends JpaRepository<ServiceOrder, Long> {
    List<ServiceOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<ServiceOrder> findAllByOrderByCreatedAtDesc();
}
