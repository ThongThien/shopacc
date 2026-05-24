package com.shopacc.backend.repository;

import com.shopacc.backend.entity.Listing;
import com.shopacc.backend.enums.ListingStatus;
import com.shopacc.backend.enums.ListingType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ListingRepository
        extends JpaRepository<Listing, Long> {

        @Query("""
                SELECT l
                FROM Listing l
                LEFT JOIN FETCH l.category
                ORDER BY l.createdAt DESC
                """)
        List<Listing> findAllWithCategory();

        @Query("""
                SELECT l
                FROM Listing l
                LEFT JOIN FETCH l.category
                WHERE
                (:status IS NULL OR l.status = :status)
                AND
                (:categoryId IS NULL OR l.category.id = :categoryId)
                AND
                (:listingType IS NULL OR l.listingType = :listingType)
                AND
                (:gameName IS NULL OR LOWER(l.gameName) LIKE CONCAT('%', LOWER(CAST(:gameName AS string)), '%'))
                ORDER BY l.createdAt DESC
                """)
        List<Listing> filterListings(
                ListingStatus status,
                Long categoryId,
                ListingType listingType,
                String gameName
        );
}