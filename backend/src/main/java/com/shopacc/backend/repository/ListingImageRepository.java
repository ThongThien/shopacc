package com.shopacc.backend.repository;

import com.shopacc.backend.entity.ListingImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface ListingImageRepository
        extends JpaRepository<ListingImage, Long> {

    List<ListingImage> findByListingId(Long listingId);

    Optional<ListingImage> findById(Long id);

    List<ListingImage> findByListingIdOrderBySortOrderAsc(Long listingId);

    void deleteByListingId(Long listingId);
}