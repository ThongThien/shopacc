package com.shopacc.backend.dto.listing;

import com.shopacc.backend.enums.ListingStatus;
import com.shopacc.backend.enums.ListingType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class ListingResponse {

    private Long id;

    private String title;

    private String slug;

    private String description;

    private BigDecimal price;

    private String thumbnail;

    private String gameName;

    private String serverName;

    private ListingType listingType;

    private ListingStatus status;

    private String categoryName;
}