package com.iavtar.gfj_be.repository;

import com.iavtar.gfj_be.entity.LedgerIdSequence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LedgerIdSequenceRepository extends JpaRepository<LedgerIdSequence, String> {
}
