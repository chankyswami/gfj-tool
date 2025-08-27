package com.iavtar.gfj_be.repository;

import com.iavtar.gfj_be.entity.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    boolean existsByClientName(String clientName);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    Optional<Client> findByClientName(String clientName);


    Page<Client> findAllByAgentId(Long agentId, Pageable pageable);

}
