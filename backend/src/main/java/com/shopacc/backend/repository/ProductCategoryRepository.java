package com.shopacc.backend.repository;

import com.shopacc.backend.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductCategoryRepository
        extends JpaRepository<ProductCategory, Long> {
    List<ProductCategory> findByParentIsNotNullOrderByNameAsc();

    List<ProductCategory> findByParentIsNullOrderBySortOrderAsc();

    List<ProductCategory> findByParentIsNotNullOrderBySortOrderAsc();
}