package com.iavtar.gfj_be.repository;

import com.iavtar.gfj_be.entity.QuotationIdSequence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuotationIdSequenceRepository extends JpaRepository<QuotationIdSequence, String> {
}
