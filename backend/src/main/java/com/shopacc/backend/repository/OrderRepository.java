package com.shopacc.backend.repository;
import org.springframework.data.repository.query.Param;
import com.shopacc.backend.enums.OrderStatus;
import com.shopacc.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

        @Query("""
                SELECT o
                FROM Order o
                LEFT JOIN FETCH o.user
                WHERE o.user.id = :userId
                ORDER BY o.createdAt DESC
                """)
        List<Order> findByUserIdWithUserOrderByCreatedAtDesc(Long userId);

        @Query("""
                SELECT o
                FROM Order o
                LEFT JOIN FETCH o.user
                WHERE o.id = :id
                """)
        Optional<Order> findByIdWithUser(Long id);

        @Query("""
                SELECT o
                FROM Order o
                LEFT JOIN FETCH o.user
                ORDER BY o.createdAt DESC
                """)
        List<Order> findAllWithUserOrderByCreatedAtDesc();

        Optional<Order> findByIdAndUserId(
                Long id,
                Long userId
        );

        long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

        long countByStatus(OrderStatus status);

        @Query("""
                select coalesce(sum(o.totalPrice), 0)
                from Order o
                where o.status = com.shopacc.backend.enums.OrderStatus.COMPLETED
                """)
        BigDecimal sumCompletedRevenueAllTime();

        @Query("""
                select coalesce(sum(o.totalPrice), 0)
                from Order o
                where o.status = com.shopacc.backend.enums.OrderStatus.COMPLETED
                and o.createdAt between :start and :end
                """)
        BigDecimal sumCompletedRevenueBetween(
                @Param("start") LocalDateTime start,
                @Param("end") LocalDateTime end
        );

        List<Order> findTop5ByOrderByTotalPriceDesc();
}