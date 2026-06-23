package com.shopacc.backend.repository;

import com.shopacc.backend.entity.Order;
import com.shopacc.backend.enums.OrderStatus;
import com.shopacc.backend.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("""
            SELECT o
            FROM Order o
            LEFT JOIN FETCH o.user
            WHERE o.id = :id
            """)
    Optional<Order> findByIdWithUser(
            @Param("id") Long id);

    @Query("""
            SELECT o
            FROM Order o
            LEFT JOIN FETCH o.user
            ORDER BY o.createdAt DESC
            """)
    List<Order> findAllWithUserOrderByCreatedAtDesc();

    @Query("""
            SELECT o
            FROM Order o
            LEFT JOIN FETCH o.user
            WHERE o.user.id = :userId
            ORDER BY o.createdAt DESC
            """)
    List<Order> findByUserIdWithUserOrderByCreatedAtDesc(
            @Param("userId") Long userId);

    Optional<Order> findByIdAndUserId(
            Long id,
            Long userId);

    long countByCreatedAtBetween(
            LocalDateTime start,
            LocalDateTime end);

    long countByStatus(
            OrderStatus status);

    @Query("""
            SELECT COALESCE(SUM(o.totalPrice), 0)
            FROM Order o
            WHERE o.status = com.shopacc.backend.enums.OrderStatus.COMPLETED
            """)
    BigDecimal sumCompletedRevenueAllTime();

    @Query("""
            SELECT COALESCE(SUM(o.totalPrice), 0)
            FROM Order o
            WHERE o.status = com.shopacc.backend.enums.OrderStatus.COMPLETED
              AND o.createdAt BETWEEN :start AND :end
            """)
    BigDecimal sumCompletedRevenueBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    List<Order> findTop5ByOrderByTotalPriceDesc();

    List<Order> findByStatusAndCreatedAtBefore(
            OrderStatus status,
            LocalDateTime createdAt);

    List<Order> findByStatusAndPaymentStatusAndCreatedAtBefore(
            OrderStatus status,
            PaymentStatus paymentStatus,
            LocalDateTime createdAt);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
}