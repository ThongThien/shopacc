package com.shopacc.backend.dto.admin;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CategoryResponse {

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

}