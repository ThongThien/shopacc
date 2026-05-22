package com.shopacc.backend.entity;

import com.shopacc.backend.entity.base.BaseEntity;
import com.shopacc.backend.enums.ListingType;
import com.shopacc.backend.enums.ListingStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "listings")
public class Listing extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ProductCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "listing_type", nullable = false)
    private ListingType listingType;

    @Column(name = "game_name")
    private String gameName;

    @Column(name = "server_name")
    private String serverName;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal price;

    private String thumbnail;

    @Column(
            name = "secret_data_encrypted",
            columnDefinition = "TEXT"
    )
    private String secretDataEncrypted;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListingStatus status;

    @Builder.Default
    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @Builder.Default
    @Column(name = "view_count")
    private Long viewCount = 0L;
}