package com.shopacc.backend.entity;

import com.shopacc.backend.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "listing_images")
public class ListingImage extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id")
    private Listing listing;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "sort_order")
    private Integer sortOrder;
}