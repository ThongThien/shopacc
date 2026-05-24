package com.shopacc.backend.service;

import com.shopacc.backend.dto.order.OrderItemResponse;
import com.shopacc.backend.dto.order.OrderResponse;
import com.shopacc.backend.dto.order.PurchaseResponse;
import com.shopacc.backend.entity.*;
import com.shopacc.backend.enums.ListingStatus;
import com.shopacc.backend.enums.OrderStatus;
import com.shopacc.backend.enums.PaymentStatus;
import com.shopacc.backend.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserBalanceLogRepository balanceLogRepository;

    @Transactional
    public PurchaseResponse purchaseListing(Long userId, Long listingId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));

        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Listing not found"
                ));

        if (listing.getStatus() != ListingStatus.PUBLISHED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Listing unavailable"
            );
        }

        if (user.getBalance().compareTo(listing.getPrice()) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Insufficient balance"
            );
        }

        BigDecimal amountBefore = user.getBalance();
        BigDecimal amountAfter = amountBefore.subtract(listing.getPrice());

        user.setBalance(amountAfter);
        userRepository.save(user);

        String orderCode = "ORD-" + UUID.randomUUID();

        Order order = Order.builder()
                .orderCode(orderCode)
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

        UserBalanceLog balanceLog = UserBalanceLog.builder()
                .user(user)
                .amountBefore(amountBefore)
                .amountChange(listing.getPrice().negate())
                .amountAfter(amountAfter)
                .type("PURCHASE")
                .description("Purchase listing: " + listing.getTitle())
                .build();

        balanceLogRepository.save(balanceLog);

        listing.setStatus(ListingStatus.SOLD_OUT);
        listingRepository.save(listing);

        return PurchaseResponse.builder()
                .orderCode(orderCode)
                .listingTitle(listing.getTitle())
                .secretData(listing.getSecretDataEncrypted())
                .build();
    }

    public List<OrderResponse> getMyOrders(Long userId) {

        return orderRepository.findByUserIdWithUserOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToOrderResponse)
                .toList();
    }

    public OrderResponse getMyOrderDetail(Long userId, Long orderId) {

        Order order = orderRepository.findByIdWithUser(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order not found"
                ));

        if (!order.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot access this order"
            );
        }

        return mapToOrderResponse(order);
    }

    public List<OrderResponse> getAllOrdersForAdmin() {

        return orderRepository.findAllWithUserOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToOrderResponse)
                .toList();
    }

    public OrderResponse getOrderDetailForAdmin(Long orderId) {

        Order order = orderRepository.findByIdWithUser(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order not found"
                ));

        return mapToOrderResponse(order);
    }

    private OrderResponse mapToOrderResponse(Order order) {

        List<OrderItemResponse> items =
                orderItemRepository.findByOrderId(order.getId())
                        .stream()
                        .map(this::mapToOrderItemResponse)
                        .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .userId(order.getUser().getId())
                .username(order.getUser().getUsername())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .createdAt(order.getCreatedAt())
                .items(items)
                .build();
    }

    private OrderItemResponse mapToOrderItemResponse(OrderItem item) {

        Long listingId = null;

        if (item.getListing() != null) {
            listingId = item.getListing().getId();
        }

        return OrderItemResponse.builder()
                .id(item.getId())
                .listingId(listingId)
                .listingTitle(item.getListingTitle())
                .listingThumbnail(item.getListingThumbnail())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .build();
    }
}