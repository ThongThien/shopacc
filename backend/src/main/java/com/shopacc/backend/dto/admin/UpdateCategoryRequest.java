package com.shopacc.backend.dto.admin;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCategoryRequest {

    private String name;

    private String slug;

    private String description;

    private Long parentId;

    private Integer sortOrder;

    private Boolean isActive;
}