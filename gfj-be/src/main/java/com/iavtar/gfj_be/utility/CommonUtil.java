package com.iavtar.gfj_be.utility;

import com.iavtar.gfj_be.entity.AppUser;
import com.iavtar.gfj_be.entity.Client;
import com.iavtar.gfj_be.entity.DashboardTab;
import com.iavtar.gfj_be.entity.Quotation;
import com.iavtar.gfj_be.entity.enums.DashboardTabs;
import com.iavtar.gfj_be.entity.enums.RoleType;
import com.iavtar.gfj_be.model.response.ClientResponse;
import com.iavtar.gfj_be.model.response.PagedUserResponse;
import com.iavtar.gfj_be.repository.AppUserRepository;
import com.iavtar.gfj_be.repository.ClientRepository;
import com.iavtar.gfj_be.repository.DashboardRepository;
import com.iavtar.gfj_be.repository.QuotationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Component
@Slf4j
public class CommonUtil {

    @Autowired
    private AppUserRepository appUserRepository;
    @Autowired
    private DashboardRepository dashboardRepository;
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private S3Util s3Util;
    @Autowired
    private QuotationRepository quotationRepository;

    public boolean existsByUsername(String username) {
        log.debug("Checking if username exists: {}", username);
        return appUserRepository.findByUsername(username).isPresent();
    }

    public boolean existsByEmail(String email) {
        log.debug("Checking if email exists: {}", email);
        return appUserRepository.findAll().stream().anyMatch(user -> user.getEmail().equalsIgnoreCase(email));
    }

    public boolean existsByPhoneNumber(String phoneNumber) {
        log.debug("Checking if phone number exists: {}", phoneNumber);
        return appUserRepository.findAll().stream().anyMatch(user -> user.getPhoneNumber().equalsIgnoreCase(phoneNumber));
    }

    public Optional<AppUser> findByUsername(String username) {
        log.debug("Finding user by username: {}", username);
        return appUserRepository.findByUsername(username);
    }

    public Optional<AppUser> findByEmail(String email) {
        log.debug("Finding user by email: {}", email);
        return appUserRepository.findAll().stream().filter(user -> user.getEmail().equalsIgnoreCase(email)).findFirst();
    }

    public Set<DashboardTab> getDashboardTabs(List<DashboardTabs> requiredTabs, String roleName) {
        log.debug("Getting dashboard tabs for {} role", roleName);
        Set<DashboardTab> tabs = new HashSet<>();
        for (DashboardTabs tabName : requiredTabs) {
            Optional<DashboardTab> tabOptional = dashboardRepository.findByName(tabName);
            if (tabOptional.isPresent()) {
                tabs.add(tabOptional.get());
                log.debug("Added dashboard tab: {} for {}", tabName, roleName);
            } else {
                log.warn("Dashboard tab not found in database: {} for {}", tabName, roleName);
            }
        }
        log.debug("Retrieved {} dashboard tabs for {}", tabs.size(), roleName);
        return tabs;
    }

    public Set<DashboardTab> getDashboardTabsForAgent() {
        List<DashboardTabs> requiredTabs = Arrays.asList(DashboardTabs.CLIENT_ADMINISTRATION, DashboardTabs.CALCULATOR, DashboardTabs.QUOTATION);
        return getDashboardTabs(requiredTabs, "agent");
    }

    public Set<DashboardTab> getDashboardTabsForBusinessAdmin() {
        List<DashboardTabs> requiredTabs = Arrays.asList(DashboardTabs.AGENT_ADMINISTRATION, DashboardTabs.CLIENT_ADMINISTRATION,
                DashboardTabs.CALCULATOR, DashboardTabs.LEDGER, DashboardTabs.SHIPPING, DashboardTabs.ANALYTICS, DashboardTabs.QUOTATION);
        return getDashboardTabs(requiredTabs, "business admin");
    }

    public AppUser addRoleAndDashboardTabs(AppUser user, com.iavtar.gfj_be.entity.Role role, Set<DashboardTab> dashboardTabs) {
        log.debug("Adding role {} and {} dashboard tabs to user: {}", role.getName(), dashboardTabs.size(), user.getUsername());
        user.addRole(role);
        for (DashboardTab tab : dashboardTabs) {
            user.addDashboardTab(tab);
        }
        log.debug("Successfully added role and dashboard tabs to user: {}", user.getUsername());
        return user;
    }

    public List<AppUser> findUsersByRole(RoleType roleType) {
        log.debug("Finding users by role: {}", roleType);
        return appUserRepository.findAll().stream().filter(user -> user.getRoles().stream().anyMatch(role -> role.getName().equals(roleType)))
                .collect(Collectors.toList());
    }

    public PagedUserResponse<AppUser> findBusinessAdmins(int offset, int size, String sortBy) {
        log.debug("Finding business admins with offset: offset={}, size={}, sortBy={}", offset, size, sortBy);
        int page = offset / size;
        Sort sort = Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<AppUser> userPage = appUserRepository.findByRoles_Name(RoleType.BUSINESS_ADMIN, pageable);
        log.info("Found {} business admins at offset {} with {} total records", userPage.getNumberOfElements(), offset, userPage.getTotalElements());
        return PagedUserResponse.from(userPage, offset, size);
    }

    public PagedUserResponse<AppUser> findAgents(int offset, int size, String sortBy) {
        log.debug("Finding agents with offset: offset={}, size={}, sortBy={}", offset, size, sortBy);
        int page = offset / size;
        Sort sort = Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<AppUser> agentPage = appUserRepository.findByRoles_Name(RoleType.AGENT, pageable);
        log.info("Found {} agents at offset {} with {} total records", agentPage.getNumberOfElements(), offset, agentPage.getTotalElements());
        return PagedUserResponse.from(agentPage, offset, size);
    }

    public Client findClientByName(String clientName) {
        log.debug("Finding client by name: {}", clientName);
        return clientRepository.findByClientName(clientName).orElse(null);
    }

    public PagedUserResponse<ClientResponse> findAllClients(int offset, int size, String sortBy) {
        log.debug("Finding all clients with offset: offset={}, size={}, sortBy={}", offset, size, sortBy);
        int page = offset / size;
        Sort sort = Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Client> clientPage = clientRepository.findAll(pageable);
        List<ClientResponse> clientResponseList = new ArrayList<>();
        for (Client client : clientPage.getContent()) {
            ClientResponse clientResponse = new ClientResponse();
            clientResponse.setId(client.getId());
            clientResponse.setClientName(client.getClientName());
            clientResponse.setBusinessLogoUrl(client.getBusinessLogoUrl());
            clientResponse.setEmail(client.getEmail());
            clientResponse.setPhoneNumber(client.getPhoneNumber());
            clientResponse.setBusinessAddress(client.getBusinessAddress());
            clientResponse.setShippingAddress(client.getShippingAddress());
            clientResponse.setCity(client.getCity());
            clientResponse.setState(client.getState());
            clientResponse.setZipCode(client.getZipCode());
            clientResponse.setCountry(client.getCountry());
            clientResponse.setEinNumber(String.valueOf(client.getEinNumber()));
            clientResponse.setTaxId(String.valueOf(client.getTaxId()));
            clientResponse.setDiamondSettingPrice(client.getDiamondSettingPrice());
            clientResponse.setGoldWastagePercentage(client.getGoldWastagePercentage());
            clientResponse.setProfitAndLabourPercentage(client.getProfitAndLabourPercentage());
            clientResponse.setCadCamWaxPrice(client.getCadCamWaxPrice());
            clientResponse.setAgentId(client.getAgentId());
            AppUser agent = appUserRepository.findById(client.getAgentId()).orElse(null);
            if (agent != null) {
                clientResponse.setAgentName(agent.getFirstName() + " " + agent.getLastName());
            } else {
                clientResponse.setAgentName("Unknown Agent");
            }
            clientResponseList.add(clientResponse);
        }
        Page<ClientResponse> clientResponses = new PageImpl<>(clientResponseList, pageable, clientPage.getTotalElements());
        log.info("Found {} clients at offset {} with {} total records", clientPage.getNumberOfElements(), offset, clientPage.getTotalElements());
        return PagedUserResponse.from(clientResponses, offset, size);
    }

    public PagedUserResponse<Client> findClientsByAgent(Long agentId, int offset, int size, String sortBy) {
        log.debug("Finding clients for agent {} with offset: offset={}, size={}, sortBy={}", agentId, offset, size, sortBy);
        int page = offset / size;
        Sort sort = Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Client> clientPage = clientRepository.findAllByAgentId(agentId, pageable);
        log.info("Found {} clients for agent {} at offset {} with {} total records", clientPage.getNumberOfElements(), agentId, offset,
                clientPage.getTotalElements());
        return PagedUserResponse.from(clientPage, offset, size);
    }

    public AppUser findAgentById(Long id) {
        log.debug("Finding agent by ID: {}", id);
        return appUserRepository.findById(id).filter(user -> user.getRoles().stream().anyMatch(role -> role.getName().equals(RoleType.AGENT)))
                .orElse(null);
    }

    public Client findClientById(Long id) {
        log.debug("Finding client by ID: {}", id);
        return clientRepository.findById(id).orElse(null);
    }

    @Transactional
    public String uploadFile(MultipartFile file) throws IOException {
        return s3Util.uploadFile(file, "quotations");
    }

    public PagedUserResponse<Quotation> findAllQuotationsByClient(Long clientId, int offset, int size, String sortBy) {
        log.debug("Finding all quotations for client: {}", clientId);
        int page = offset / size;
        Sort sort = Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Quotation> quotationPage = quotationRepository.findAllByClientId(clientId, pageable);
        log.info("Found {} quotations for client: {}", quotationPage.getNumberOfElements(), clientId);
        return PagedUserResponse.from(quotationPage, offset, size);
    }

    public PagedUserResponse<Quotation> findAllQuotationsByAgent(Long agentId, int offset, int size, String sortBy) {
        log.debug("Finding all quotations for agent: {}", agentId);
        int page = offset / size;
        Sort sort = Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Quotation> quotationPage = quotationRepository.findAllByAgentId(agentId, pageable);
        log.info("Found {} quotations for agent: {}", quotationPage.getNumberOfElements(), agentId);
        return PagedUserResponse.from(quotationPage, offset, size);
    }

    public PagedUserResponse<Quotation> findAllQuotationsByClientAndAgent(Long clientId, Long agentId, int offset, int size, String sortBy) {
        log.debug("Finding all quotations for client: {} and agent: {}", clientId, agentId);
        int page = offset / size;
        Sort sort = Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Quotation> quotationPage = quotationRepository.findAllByClientIdAndAgentId(clientId, agentId, pageable);
        log.info("Found {} quotations for client: {} and agent: {}", quotationPage.getNumberOfElements(), clientId, agentId);
        return PagedUserResponse.from(quotationPage, offset, size);
    }

    public PagedUserResponse<Quotation> findAllQuotations(int offset, int size, String sortBy) {
        log.debug("Finding all quotations with offset: offset={}, size={}, sortBy={}", offset, size, sortBy);
        int page = offset / size;
        Sort sort = Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Quotation> quotationPage = quotationRepository.findAll(pageable);
        log.info("Found {} quotations at offset {} with {} total records", quotationPage.getNumberOfElements(), offset, quotationPage.getTotalElements());
        return PagedUserResponse.from(quotationPage, offset, size);
    }


}