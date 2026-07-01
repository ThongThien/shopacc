package com.shopacc.backend.repository;

import com.shopacc.backend.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserIdOrderByAddedAtDesc(Long userId);
    void deleteByUserIdAndListingId(Long userId, Long listingId);
    void deleteByUserId(Long userId);
    boolean existsByUserIdAndListingId(Long userId, Long listingId);
}
