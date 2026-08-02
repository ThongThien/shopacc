package com.shopacc.backend.dto.admin;

import com.shopacc.backend.enums.ListingType;
import com.shopacc.backend.enums.ListingStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class UpdateListingRequest {

    private Long categoryId;

    private ListingType listingType;

    private String gameName;

    private String serverName;

    private String title;

    private String slug;

    private String description;

    private BigDecimal price;

    private String thumbnail;

    private ListingStatus status;

    private String secretDataEncrypted;
}