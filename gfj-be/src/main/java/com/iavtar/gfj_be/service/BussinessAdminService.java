package com.iavtar.gfj_be.service;

import com.iavtar.gfj_be.entity.AppUser;
import com.iavtar.gfj_be.entity.DashboardTab;
import com.iavtar.gfj_be.entity.Role;
import com.iavtar.gfj_be.entity.enums.RoleType;
import com.iavtar.gfj_be.model.request.AppUserRequest;
import com.iavtar.gfj_be.model.response.PagedUserResponse;
import com.iavtar.gfj_be.repository.AppUserRepository;
import com.iavtar.gfj_be.repository.ClientRepository;
import com.iavtar.gfj_be.repository.RoleRepository;
import com.iavtar.gfj_be.utility.CommonUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@Slf4j
public class BussinessAdminService {

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CommonUtil commonUtil;

    @Autowired
    private ClientRepository clientRepository;

    @Transactional
    public void createAgent(String username, String firstName, String lastName, String password, String email, String phoneNumber) {
        try {

            Role agentRole = roleRepository.findByName(RoleType.AGENT).orElseThrow(() -> {
                log.error("AGENT role not found in database");
                return new IllegalStateException("AGENT role not found in database");
            });
            Set<DashboardTab> agentDashboardTabs = commonUtil.getDashboardTabsForAgent();
            AppUser savedUser = appUserRepository.save(commonUtil.addRoleAndDashboardTabs(
                    AppUser.builder().username(username).firstName(firstName).lastName(lastName).password(passwordEncoder.encode(password))
                            .email(email).phoneNumber(phoneNumber).isActive(true).roles(new HashSet<>()).dashboardTabs(new HashSet<>()).build(),
                    agentRole, agentDashboardTabs));
            log.info("Successfully created agent: {} with ID: {}", savedUser.getUsername(), savedUser.getId());
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("Business logic error creating agent {}: {}", username, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error creating agent {}: {}", username, e.getMessage(), e);
            throw e;
        }
    }

    public AppUser getAgent(String username) {
        return commonUtil.findByUsername(username).orElse(null);
    }

    public PagedUserResponse<AppUser> getAgents(int offset, int size, String sortBy) {
        return commonUtil.findAgents(offset, size, sortBy);
    }

    public AppUser getAgentById(Long id) {
        return commonUtil.findAgentById(id);
    }

    public AppUser updateAgent(AppUserRequest request) {
        AppUser existingAgent = commonUtil.findAgentById(request.getId());
        if (existingAgent == null) {
            throw new IllegalArgumentException("Agent not found with ID: " + request.getId());
        }
        // Update only non-null fields (partial update)
        if (request.getUsername() != null) {
            existingAgent.setUsername(request.getUsername());
        }
        if (request.getFirstName() != null) {
            existingAgent.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            existingAgent.setLastName(request.getLastName());
        }
        if (request.getEmail() != null) {
            existingAgent.setEmail(request.getEmail());
        }
        if (request.getPhoneNumber() != null) {
            existingAgent.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getPassword() != null) {
            existingAgent.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        existingAgent.setIsActive(request.isActive());
        AppUser updatedAgent = appUserRepository.save(existingAgent);
        log.info("Agent updated successfully with ID: {}", updatedAgent.getId());
        return updatedAgent;
    }

    public void deleteClient(Long id) {
        clientRepository.deleteById(id);
    }

}
