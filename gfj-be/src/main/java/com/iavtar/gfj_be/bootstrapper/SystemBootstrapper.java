package com.iavtar.gfj_be.bootstrapper;

import com.iavtar.gfj_be.entity.AppUser;
import com.iavtar.gfj_be.entity.DashboardTab;
import com.iavtar.gfj_be.entity.Role;
import com.iavtar.gfj_be.entity.enums.DashboardTabs;
import com.iavtar.gfj_be.entity.enums.RoleType;
import com.iavtar.gfj_be.repository.AppUserRepository;
import com.iavtar.gfj_be.repository.DashboardRepository;
import com.iavtar.gfj_be.repository.RoleRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Component
public class SystemBootstrapper implements CommandLineRunner {

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private DashboardRepository dashboardRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Deploy All Roles
        for (RoleType roleType : RoleType.values()) {
            Optional<Role> role = roleRepository.findByName(roleType);
            if (role.isEmpty()) {
                roleRepository.save(Role.builder().name(roleType).build());
            }
        }
        //Deploy All Dashboards
        for (DashboardTabs dashboardTabs : DashboardTabs.values()) {
            Optional<DashboardTab> dashboardTab = dashboardRepository.findByName(dashboardTabs);
            if (dashboardTab.isEmpty()) {
                dashboardRepository.save(DashboardTab.builder().name(dashboardTabs).build());
            }
        }
        //Create System Super Admin
        Optional<AppUser> user = userRepository.findByUsername("iavtar");
        if (user.isEmpty()) {
            Optional<Role> superAdminRole = roleRepository.findByName(RoleType.SUPER_ADMIN);
            Set<Role> superAdminRoles = new HashSet<>();
            superAdminRoles.add(superAdminRole.get());
            Optional<DashboardTab> superAdminDashboardTab = dashboardRepository.findByName(DashboardTabs.ADMINISTRATION);
            Set<DashboardTab> superAdminDashboardTabs = new HashSet<>();
            superAdminDashboardTabs.add(superAdminDashboardTab.get());
            userRepository.save(AppUser.builder().username("iavtar").firstName("System").lastName("Master").password(passwordEncoder.encode("12345"))
                    .email("admin@gmail.com").phoneNumber("1234567890").isActive(true).roles(superAdminRoles).dashboardTabs(superAdminDashboardTabs)
                    .build());
        }
    }

}
