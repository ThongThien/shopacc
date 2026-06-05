package com.shopacc.backend.dto.admin;

import com.shopacc.backend.enums.ListingStatus;
import com.shopacc.backend.enums.ListingType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class AdminListingDetailResponse {

    private Long id;

    private Long categoryId;

    private String categoryName;

    private ListingType listingType;

    private String gameName;

    private String serverName;

    private String title;

    private String slug;

    private String description;

    private BigDecimal price;

    private String thumbnail;

    private ListingStatus status;

    private Boolean isFeatured;

    private Long viewCount;

    private String secretData;

    private List<String> images;

    private Boolean sold;

    private Long buyerUserId;

    private String buyerUsername;

    private String buyerEmail;

    private Long orderId;

    private String orderCode;

    private LocalDateTime soldAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}