package com.shopacc.backend.repository;

import com.shopacc.backend.entity.UserBalanceLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserBalanceLogRepository
                extends JpaRepository<UserBalanceLog, Long> {
}