package com.shopacc.backend.repository;

import com.shopacc.backend.entity.Listing;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ListingRepository
        extends JpaRepository<Listing, Long> {
}