package com.shopacc.backend.dto.admin;

import com.shopacc.backend.enums.ListingStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateListingStatusRequest {

    private ListingStatus status;
}