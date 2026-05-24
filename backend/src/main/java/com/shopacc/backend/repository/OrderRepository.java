package com.shopacc.backend.repository;

import com.shopacc.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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
}