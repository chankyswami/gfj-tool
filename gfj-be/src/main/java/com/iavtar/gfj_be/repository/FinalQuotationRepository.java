package com.iavtar.gfj_be.repository;

import com.iavtar.gfj_be.entity.FinalQuotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FinalQuotationRepository extends JpaRepository<FinalQuotation, Long> {

    Optional<FinalQuotation> findByFinalQuotationId(String finalQuotationId);

}
