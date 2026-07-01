package com.shopacc.backend.controller;

import com.shopacc.backend.entity.CartItem;
import com.shopacc.backend.entity.Listing;
import com.shopacc.backend.repository.CartItemRepository;
import com.shopacc.backend.repository.ListingRepository;
import com.shopacc.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartItemRepository cartItemRepository;
    private final ListingRepository listingRepository;

    @GetMapping
    public List<Map<String, Object>> getMyCart(
                    @AuthenticationPrincipal CustomUserDetails userDetails) {

        List<CartItem> items = cartItemRepository.findByUserIdOrderByAddedAtDesc(userDetails.getId());

        return items.stream().map(item -> {
            Listing listing = listingRepository.findById(item.getListingId()).orElse(null);
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", item.getId());
            map.put("listingId", item.getListingId());
            map.put("addedAt", item.getAddedAt());

            if (listing != null && listing.getStatus() == com.shopacc.backend.enums.ListingStatus.PUBLISHED) {
                map.put("title", listing.getTitle());
                map.put("price", listing.getPrice());
                map.put("thumbnail", listing.getThumbnail());
                map.put("gameName", listing.getGameName());
                map.put("serverName", listing.getServerName());
                map.put("available", true);
            } else {
                map.put("available", false);
            }
            return map;
        }).collect(Collectors.toList());
    }

    @PostMapping("/{listingId}")
    public Map<String, Object> addToCart(
                    @AuthenticationPrincipal CustomUserDetails userDetails,
                    @PathVariable Long listingId) {

        if (cartItemRepository.existsByUserIdAndListingId(userDetails.getId(), listingId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already in cart");
        }

        Listing listing = listingRepository.findById(listingId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));

        if (listing.getStatus() != com.shopacc.backend.enums.ListingStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Listing is not available");
        }

        CartItem item = CartItem.builder()
                        .userId(userDetails.getId())
                        .listingId(listingId)
                        .addedAt(LocalDateTime.now())
                        .build();
        cartItemRepository.save(item);

        return Map.of("success", true, "listingId", listingId);
    }

    @DeleteMapping("/{listingId}")
    public Map<String, Object> removeFromCart(
                    @AuthenticationPrincipal CustomUserDetails userDetails,
                    @PathVariable Long listingId) {

        cartItemRepository.deleteByUserIdAndListingId(userDetails.getId(), listingId);
        return Map.of("success", true);
    }

    @DeleteMapping
    public Map<String, Object> clearCart(
                    @AuthenticationPrincipal CustomUserDetails userDetails) {

        cartItemRepository.deleteByUserId(userDetails.getId());
        return Map.of("success", true);
    }
}
