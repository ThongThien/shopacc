package com.shopacc.backend.repository;

import com.shopacc.backend.entity.DiscountCode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DiscountCodeRepository extends JpaRepository<DiscountCode, Long> {
    Optional<DiscountCode> findByCodeAndIsActiveTrue(String code);
}
