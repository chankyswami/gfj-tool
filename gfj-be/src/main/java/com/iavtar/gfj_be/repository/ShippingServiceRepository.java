package com.iavtar.gfj_be.repository;

import com.iavtar.gfj_be.entity.ShippingTracker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShippingServiceRepository extends JpaRepository<ShippingTracker, Long> {
    
    Optional<ShippingTracker> findByShippingId(String shippingId);
    
}
