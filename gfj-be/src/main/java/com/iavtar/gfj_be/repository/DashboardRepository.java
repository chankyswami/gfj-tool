package com.iavtar.gfj_be.repository;

import com.iavtar.gfj_be.entity.DashboardTab;
import com.iavtar.gfj_be.entity.enums.DashboardTabs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DashboardRepository extends JpaRepository<DashboardTab, Integer> {
    Optional<DashboardTab> findByName(DashboardTabs dashboardType);
}
