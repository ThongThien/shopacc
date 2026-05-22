package com.shopacc.backend.service;

import com.shopacc.backend.dto.listing.CreateListingRequest;
import com.shopacc.backend.dto.listing.ListingResponse;
import com.shopacc.backend.entity.Listing;
import com.shopacc.backend.entity.ProductCategory;
import com.shopacc.backend.enums.ListingStatus;
import com.shopacc.backend.repository.ListingRepository;
import com.shopacc.backend.repository.ProductCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.shopacc.backend.entity.ListingImage;
import com.shopacc.backend.dto.listing.ListingDetailResponse;
import com.shopacc.backend.repository.ListingImageRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepository;

    private final ProductCategoryRepository categoryRepository;

    private final ListingImageRepository listingImageRepository;

    public ListingResponse createListing(
            CreateListingRequest request
    ) {

        ProductCategory category =
                categoryRepository.findById(request.getCategoryId())
                        .orElseThrow(
                                () -> new RuntimeException("Category not found")
                        );

        Listing listing = Listing.builder()
                .category(category)
                .listingType(request.getListingType())
                .gameName(request.getGameName())
                .serverName(request.getServerName())
                .title(request.getTitle())
                .slug(request.getSlug())
                .description(request.getDescription())
                .price(request.getPrice())
                .thumbnail(request.getThumbnail())
                .secretDataEncrypted(
                        request.getSecretDataEncrypted()
                )
                .status(ListingStatus.PUBLISHED)
                .build();

        Listing saved =
                listingRepository.save(listing);

        return mapToResponse(saved);
    }

    public List<ListingResponse> getAllListings() {

        return listingRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ListingResponse mapToResponse(
            Listing listing
    ) {

        return ListingResponse.builder()
                .id(listing.getId())
                .title(listing.getTitle())
                .slug(listing.getSlug())
                .description(listing.getDescription())
                .price(listing.getPrice())
                .thumbnail(listing.getThumbnail())
                .gameName(listing.getGameName())
                .serverName(listing.getServerName())
                .listingType(listing.getListingType())
                .status(listing.getStatus())
                .categoryName(
                        listing.getCategory().getName()
                )
                .build();
    }
    public ListingDetailResponse getListingDetail(
        Long id
    ) {

        Listing listing =
                listingRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException("Listing not found")
                        );

        List<ListingImage> listingImages =
                listingImageRepository.findByListingId(id);

        List<String> imageUrls =
                listingImages.stream()
                        .map(ListingImage::getImageUrl)
                        .toList();

        return ListingDetailResponse.builder()
                .id(listing.getId())
                .title(listing.getTitle())
                .slug(listing.getSlug())
                .description(listing.getDescription())
                .price(listing.getPrice())
                .thumbnail(listing.getThumbnail())
                .gameName(listing.getGameName())
                .serverName(listing.getServerName())
                .listingType(listing.getListingType())
                .status(listing.getStatus())
                .isFeatured(listing.getIsFeatured())
                .viewCount(listing.getViewCount())
                .categoryName(
                        listing.getCategory().getName()
                )
                .images(imageUrls)
                .build();
    }
}