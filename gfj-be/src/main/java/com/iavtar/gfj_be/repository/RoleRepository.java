package com.iavtar.gfj_be.repository;

import com.iavtar.gfj_be.entity.Role;
import com.iavtar.gfj_be.entity.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByName(RoleType roleType);
}
