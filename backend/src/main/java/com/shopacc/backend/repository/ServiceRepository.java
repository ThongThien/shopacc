package com.shopacc.backend.repository;

import com.shopacc.backend.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByGameNameAndIsActiveTrueOrderByCreatedAtDesc(String gameName);
    List<Service> findAllByOrderByCreatedAtDesc();
}
