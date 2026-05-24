package com.shopacc.backend.controller;

import com.shopacc.backend.dto.listing.CreateListingRequest;
import com.shopacc.backend.dto.listing.ListingDetailResponse;
import com.shopacc.backend.dto.listing.ListingResponse;
import com.shopacc.backend.service.ListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;

    @GetMapping
    public List<ListingResponse> getAllListings() {
        return listingService.getAllListings();
    }

    @GetMapping("/{id}")
    public ListingDetailResponse getListingDetail(@PathVariable Long id) {
        return listingService.getListingDetail(id);
    }

    @PostMapping
    public ListingResponse createListing(@RequestBody CreateListingRequest request) {
        return listingService.createListing(request);
    }

    @PostMapping(
            value = "/{listingId}/images",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Map<String, String> uploadListingImage(
            @PathVariable Long listingId,
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        String imageUrl = listingService.uploadListingImage(listingId, file);

        return Map.of("url", imageUrl);
    }
}