package com.shopacc.backend.dto.admin;

import com.shopacc.backend.dto.listing.ListingResponse;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class AdminCategoryDetailResponse {

    private Long id;

    private String name;

    private String slug;

    private String description;

    private Boolean isActive;

    private Integer sortOrder;

    private Long parentId;

    private String parentName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Long listingCount;

    private List<ListingResponse> listings;
}