package com.shopacc.backend.controller;

import com.shopacc.backend.dto.listing.CreateListingRequest;
import com.shopacc.backend.dto.listing.ListingResponse;
import com.shopacc.backend.service.ListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.shopacc.backend.dto.listing.ListingDetailResponse;

import java.util.List;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;

    @GetMapping
    public List<ListingResponse> getAllListings() {

        return listingService.getAllListings();
    }

    @PostMapping
    public ListingResponse createListing(
            @RequestBody CreateListingRequest request
    ) {

        return listingService.createListing(request);
    }
    @GetMapping("/{id}")
    public ListingDetailResponse getListingDetail(
            @PathVariable Long id
    ) {

        return listingService.getListingDetail(id);
    }
}