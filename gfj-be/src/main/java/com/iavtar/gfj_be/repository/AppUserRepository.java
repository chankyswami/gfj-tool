package com.iavtar.gfj_be.repository;

import com.iavtar.gfj_be.entity.AppUser;
import com.iavtar.gfj_be.entity.enums.RoleType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByUsername(String username);

    Page<AppUser> findByRoles_Name(RoleType roleType, Pageable pageable);

}
