package com.iavtar.gfj_be.repository;

import com.iavtar.gfj_be.entity.ShippingIdSequence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShippingIdSequenceRepository extends JpaRepository<ShippingIdSequence, String> {
}
