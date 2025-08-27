package com.iavtar.gfj_be.service;

import com.iavtar.gfj_be.entity.Client;
import com.iavtar.gfj_be.model.request.ClientRequest;
import com.iavtar.gfj_be.model.response.ClientResponse;
import com.iavtar.gfj_be.model.response.PagedUserResponse;
import com.iavtar.gfj_be.model.response.ServiceResponse;
import com.iavtar.gfj_be.repository.AppUserRepository;
import com.iavtar.gfj_be.repository.ClientRepository;
import com.iavtar.gfj_be.utility.CommonUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AgentService {

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private CommonUtil commonUtil;

    public boolean existsByClientName(String clientName) {
        return clientRepository.existsByClientName(clientName);
    }

    public boolean existsByEmail(String email) {
        return clientRepository.existsByEmail(email);
    }

    public boolean existsByPhoneNumber(String phoneNumber) {
        return clientRepository.existsByPhoneNumber(phoneNumber);
    }

    public Client createClient(ClientRequest request) {
        log.info("Agent creating client: {}", request.getClientName());
        Client savedClient = clientRepository.save(
                Client.builder().clientName(request.getClientName()).businessLogoUrl(request.getBusinessLogoUrl()).email(request.getEmail())
                        .phoneNumber(request.getPhoneNumber()).businessAddress(request.getBusinessAddress())
                        .shippingAddress(request.getShippingAddress()).city(request.getCity()).state(request.getState()).country(request.getCountry())
                        .zipCode(request.getZipCode()).einNumber(request.getEinNumber()).taxId(request.getTaxId())
                        .diamondSettingPrice(request.getDiamondSettingPrice()).goldWastagePercentage(request.getGoldWastagePercentage())
                        .profitAndLabourPercentage(request.getProfitAndLabourPercentage()).cadCamWaxPrice(request.getCadCamWaxPrice())
                        .agentId(request.getAgentId()).build());

        log.info("Client created successfully with ID: {} by agent: {}", savedClient.getId(), request.getAgentId());

        return savedClient;
    }

    public Client getClientByName(String clientName) {
        log.info("Getting client by name: {}", clientName);
        return commonUtil.findClientByName(clientName);
    }

    public PagedUserResponse<ClientResponse> getAllClients(int offset, int size, String sortBy) {
        log.info("Getting all clients with pagination");
        return commonUtil.findAllClients(offset, size, sortBy);
    }

    public PagedUserResponse<Client> getClientsByAgent(Long agentId, int offset, int size, String sortBy) {
        log.info("Getting clients for agent: {}", agentId);
        return commonUtil.findClientsByAgent(agentId, offset, size, sortBy);
    }

    public Client getClientById(Long id) {
        return commonUtil.findClientById(id);
    }

    public Client updateClient(ClientRequest request) {
        log.info("Updating client with ID: {}", request.getId());
        Client existingClient = commonUtil.findClientById(request.getId());
        if (existingClient == null) {
            throw new IllegalArgumentException("Client not found with ID: " + request.getId());
        }
        // Update only non-null fields (partial update)
        if (request.getClientName() != null) {
            existingClient.setClientName(request.getClientName());
        }
        if (request.getBusinessLogoUrl() != null) {
            existingClient.setBusinessLogoUrl(request.getBusinessLogoUrl());
        }
        if (request.getEmail() != null) {
            existingClient.setEmail(request.getEmail());
        }
        if (request.getPhoneNumber() != null) {
            existingClient.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getBusinessAddress() != null) {
            existingClient.setBusinessAddress(request.getBusinessAddress());
        }
        if (request.getShippingAddress() != null) {
            existingClient.setShippingAddress(request.getShippingAddress());
        }
        if (request.getCity() != null) {
            existingClient.setCity(request.getCity());
        }
        if (request.getState() != null) {
            existingClient.setState(request.getState());
        }
        if (request.getCountry() != null) {
            existingClient.setCountry(request.getCountry());
        }
        if (request.getZipCode() != null) {
            existingClient.setZipCode(request.getZipCode());
        }
        if (request.getEinNumber() != null) {
            existingClient.setEinNumber(request.getEinNumber());
        }
        if (request.getTaxId() != null) {
            existingClient.setTaxId(request.getTaxId());
        }
        if (request.getDiamondSettingPrice() != null) {
            existingClient.setDiamondSettingPrice(request.getDiamondSettingPrice());
        }
        if (request.getGoldWastagePercentage() != null) {
            existingClient.setGoldWastagePercentage(request.getGoldWastagePercentage());
        }
        if (request.getProfitAndLabourPercentage() != null) {
            existingClient.setProfitAndLabourPercentage(request.getProfitAndLabourPercentage());
        }
        if (request.getCadCamWaxPrice() != null) {
            existingClient.setCadCamWaxPrice(request.getCadCamWaxPrice());
        }
        if (request.getAgentId() != null) {
            existingClient.setAgentId(request.getAgentId());
        }
        Client updatedClient = clientRepository.save(existingClient);
        log.info("Client updated successfully with ID: {}", updatedClient.getId());
        return updatedClient;
    }

    public ResponseEntity<?> deleteAgent(Long agentId) {
        try {
            userRepository.deleteById(agentId);
            return new ResponseEntity<>(
                    ServiceResponse.builder()
                            .message("Agent Deleted Successfully!")
                            .build(),
                    HttpStatus.OK
            );
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

}