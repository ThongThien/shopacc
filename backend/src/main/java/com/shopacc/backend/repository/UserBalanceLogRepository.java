package com.shopacc.backend.repository;

import com.shopacc.backend.entity.UserBalanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserBalanceLogRepository
                extends JpaRepository<UserBalanceLog, Long> {
    List<UserBalanceLog> findByUserIdOrderByCreatedAtDesc(Long userId);
}