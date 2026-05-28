package com.shopacc.backend.dto.listing;

import com.shopacc.backend.enums.ListingType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreateListingRequest {

    @NotNull(message = "categoryId is required")
    private Long categoryId;

    @NotNull(message = "listingType is required")
    private ListingType listingType;

    @NotBlank(message = "gameName is required")
    private String gameName;

    private String serverName;

    @NotBlank(message = "title is required")
    private String title;

    @NotBlank(message = "slug is required")
    private String slug;

    private String description;

    @NotNull(message = "price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "price must be greater than 0")
    private BigDecimal price;

    private String thumbnail;

    @NotBlank(message = "secretDataEncrypted is required")
    private String secretDataEncrypted;
}