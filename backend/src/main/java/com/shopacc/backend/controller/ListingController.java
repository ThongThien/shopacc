package com.shopacc.backend.controller;

import jakarta.validation.Valid;
import com.shopacc.backend.dto.listing.CreateListingRequest;
import com.shopacc.backend.dto.listing.ListingDetailResponse;
import com.shopacc.backend.dto.listing.ListingResponse;
import com.shopacc.backend.service.ListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.shopacc.backend.enums.AuditAction;
import com.shopacc.backend.security.CustomUserDetails;
import com.shopacc.backend.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;

    private final AuditLogService auditLogService;

    @GetMapping
    public List<ListingResponse> getAllListings() {
        return listingService.getAllListings();
    }

    @GetMapping("/{id}")
    public ListingDetailResponse getListingDetail(@PathVariable Long id) {
        return listingService.getListingDetail(id);
    }

    @PostMapping
    public ListingResponse createListing(@Valid @RequestBody CreateListingRequest request) {
        return listingService.createListing(request);
    }

    @PostMapping(value = "/{listingId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadListingImage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long listingId,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest httpRequest) throws IOException {

        String imageUrl = listingService.uploadListingImage(listingId, file);

        auditLogService.log(
                userDetails.getId(),
                AuditAction.ADMIN_UPLOAD_LISTING_IMAGE,
                "listingId=" + listingId + ", imageUrl=" + imageUrl,
                httpRequest);

        return Map.of("url", imageUrl);
    }
}