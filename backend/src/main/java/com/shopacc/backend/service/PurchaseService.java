package com.shopacc.backend.service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.shopacc.backend.entity.*;
import com.shopacc.backend.enums.ListingStatus;
import com.shopacc.backend.enums.OrderStatus;
import com.shopacc.backend.enums.PaymentStatus;
import com.shopacc.backend.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final ListingRepository listingRepository;

    private final UserRepository userRepository;

    private final OrderRepository orderRepository;

    private final OrderItemRepository orderItemRepository;

    private final UserBalanceLogRepository balanceLogRepository;

    @Transactional
    public String purchaseListing(
            Long userId,
            Long listingId
    ) {

        User user =
                userRepository.findById(userId)
                        .orElseThrow(
                                () -> new RuntimeException("User not found")
                        );

        Listing listing =
                listingRepository.findById(listingId)
                        .orElseThrow(
                                () -> new RuntimeException("Listing not found")
                        );

        if (listing.getStatus() != ListingStatus.PUBLISHED) {
            throw new RuntimeException("Listing unavailable");
        }

        if (
                user.getBalance().compareTo(
                        listing.getPrice()
                ) < 0
        ) {

        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Insufficient balance"
        );
        }

        BigDecimal before = user.getBalance();

        BigDecimal after =
                before.subtract(listing.getPrice());

        user.setBalance(after);

        Order order = Order.builder()
                .orderCode(
                        "ORD-" + UUID.randomUUID()
                )
                .user(user)
                .totalPrice(listing.getPrice())
                .status(OrderStatus.COMPLETED)
                .paymentStatus(PaymentStatus.PAID)
                .build();

        orderRepository.save(order);

        OrderItem orderItem = OrderItem.builder()
                .order(order)
                .listing(listing)
                .listingTitle(listing.getTitle())
                .listingThumbnail(listing.getThumbnail())
                .quantity(1)
                .price(listing.getPrice())
                .createdAt(LocalDateTime.now())
                .build();

        orderItemRepository.save(orderItem);

        UserBalanceLog balanceLog =
                UserBalanceLog.builder()
                        .user(user)
                        .amountBefore(before)
                        .amountChange(
                                listing.getPrice().negate()
                        )
                        .amountAfter(after)
                        .type("PURCHASE")
                        .description(
                                "Purchase listing: " +
                                        listing.getTitle()
                        )
                        .createdAt(LocalDateTime.now())
                        .build();

        balanceLogRepository.save(balanceLog);

        listing.setStatus(ListingStatus.SOLD_OUT);

        return listing.getSecretDataEncrypted();
    }
}