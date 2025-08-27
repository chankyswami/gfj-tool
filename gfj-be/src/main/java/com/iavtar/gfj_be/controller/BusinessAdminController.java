package com.iavtar.gfj_be.controller;

import com.iavtar.gfj_be.entity.AppUser;
import com.iavtar.gfj_be.entity.Client;
import com.iavtar.gfj_be.entity.Material;
import com.iavtar.gfj_be.entity.Quotation;
import com.iavtar.gfj_be.model.request.AppUserRequest;
import com.iavtar.gfj_be.model.request.ClientRequest;
import com.iavtar.gfj_be.model.response.ClientResponse;
import com.iavtar.gfj_be.model.response.PagedUserResponse;
import com.iavtar.gfj_be.model.response.ServiceResponse;
import com.iavtar.gfj_be.repository.MaterialRepository;
import com.iavtar.gfj_be.service.AgentService;
import com.iavtar.gfj_be.service.BussinessAdminService;
import com.iavtar.gfj_be.service.MaterialService;
import com.iavtar.gfj_be.service.QuotationService;
import com.iavtar.gfj_be.utility.CommonUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/businessAdmin")
public class BusinessAdminController {

    @Autowired
    private BussinessAdminService bussinessAdminService;

    @Autowired
    private CommonUtil commonUtil;

    @Autowired
    private AgentService agentService;

    @Autowired
    private MaterialService materialService;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private QuotationService quotationService;

    @PostMapping("/agent")
    public ResponseEntity<?> createAgent(@RequestBody AppUserRequest request) {
        try {
            log.info("Creating new agent with username: {}", request.getUsername());
            if (commonUtil.existsByUsername(request.getUsername())) {
                log.error("Validation failed - agent already exists: {}", request.getUsername());
                ServiceResponse errorResponse = ServiceResponse.builder().message("agent already exists").build();
                return ResponseEntity.internalServerError().body(errorResponse);
            }
            if (commonUtil.existsByEmail(request.getEmail())) {
                log.error("Validation failed - email already exists: {}", request.getEmail());
                ServiceResponse errorResponse = ServiceResponse.builder().message("email already exists").build();
                return ResponseEntity.internalServerError().body(errorResponse);
            }
            if (commonUtil.existsByPhoneNumber(request.getPhoneNumber())) {
                log.error("Validation failed - phone number already exists: {}", request.getPhoneNumber());
                ServiceResponse errorResponse = ServiceResponse.builder().message("Phone Number already exists").build();
                return ResponseEntity.internalServerError().body(errorResponse);
            }
            // Create the business admin user
            bussinessAdminService.createAgent(request.getUsername(), request.getFirstName(), request.getLastName(), request.getPassword(),
                    request.getEmail(), request.getPhoneNumber());
            ServiceResponse response = ServiceResponse.builder().message("Agent Created Successfully").build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error creating Agent: ").build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/getAgent")
    public ResponseEntity<?> getAgent(@RequestParam("username") String username) {
        try {
            AppUser appUser = bussinessAdminService.getAgent(username);
            return ResponseEntity.ok(appUser);
        } catch (Exception e) {
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error getting Agent: " + username).build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/getAllAgents")
    public ResponseEntity<?> getAllAgent(@RequestParam(defaultValue = "0") int offset, @RequestParam(defaultValue = "10") int size,
                                         @RequestParam(defaultValue = "id") String sortBy) {
        try {
            PagedUserResponse<AppUser> response = bussinessAdminService.getAgents(offset, size, sortBy);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error getting all Agents").build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @DeleteMapping("/deleteAgent/{agentId}")
    public ResponseEntity<?> deleteAgent(@PathVariable Long agentId) {
        return agentService.deleteAgent(agentId);
    }

    @GetMapping("/clients")
    public ResponseEntity<?> getAllClients(@RequestParam(defaultValue = "0") int offset, @RequestParam(defaultValue = "10") int size,
                                           @RequestParam(defaultValue = "id") String sortBy) {
        try {
            log.info("Getting all clients with pagination: offset={}, size={}, sortBy={}", offset, size, sortBy);
            PagedUserResponse<ClientResponse> response = agentService.getAllClients(offset, size, sortBy);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting all clients: {}", e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error getting all clients").build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/updateAgent")
    public ResponseEntity<?> updateAgent(@RequestBody AppUserRequest request) {
        try {
            log.info("Updating agent with ID: {}", request.getId());
            if (request.getId() == null) {
                ServiceResponse errorResponse = ServiceResponse.builder().message("Agent ID is required for update").build();
                return ResponseEntity.badRequest().body(errorResponse);
            }
            AppUser existingAgent = bussinessAdminService.getAgentById(request.getId());
            if (existingAgent == null) {
                log.error("Agent with ID {} does not exist", request.getId());
                ServiceResponse errorResponse = ServiceResponse.builder().message("Agent not found with ID: " + request.getId()).build();
                return ResponseEntity.notFound().build();
            }
            // Update the agent
            AppUser updatedAgent = bussinessAdminService.updateAgent(request);
            log.info("Agent updated successfully with ID: {}", updatedAgent.getId());

            ServiceResponse response = ServiceResponse.builder().message("Agent updated successfully").build();
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Validation error updating agent: {}", e.getMessage());
            ServiceResponse errorResponse = ServiceResponse.builder().message(e.getMessage()).build();
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("Error updating agent: {}", e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error updating agent: " + e.getMessage()).build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/updateClient")
    public ResponseEntity<?> updateClient(@RequestBody ClientRequest request) {
        try {
            log.info("Updating client with ID: {}", request.getId());
            if (request.getId() == null) {
                ServiceResponse errorResponse = ServiceResponse.builder().message("Client ID is required for update").build();
                return ResponseEntity.badRequest().body(errorResponse);
            }
            Client existingClient = agentService.getClientById(request.getId());
            if (existingClient == null) {
                log.error("Client with ID {} does not exist", request.getId());
                ServiceResponse errorResponse = ServiceResponse.builder().message("Client not found with ID: " + request.getId()).build();
                return ResponseEntity.notFound().build();
            }
            // Update the agent
            Client updatedClient = agentService.updateClient(request);
            log.info("Client updated successfully with ID: {}", updatedClient.getId());
            ServiceResponse response = ServiceResponse.builder().message("Agent updated successfully").build();
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Validation error updating client: {}", e.getMessage());
            ServiceResponse errorResponse = ServiceResponse.builder().message(e.getMessage()).build();
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("Error updating client: {}", e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error updating client").build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @DeleteMapping("/deleteClient/{clientId}")
    public ResponseEntity<?> deleteClient(@PathVariable Long clientId) {
        try {
            bussinessAdminService.deleteClient(clientId);
            ServiceResponse response = ServiceResponse.builder().message("Client deleted successfully").build();
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Validation error deleting client: {}", e.getMessage());
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error deleting client").build();
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/materials")
    public ResponseEntity<?> getAllMaterials() {
        try {
            return ResponseEntity.ok(materialService.getAllMaterials());
        } catch (IllegalArgumentException e) {
            log.error("Error getting material list", e);
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error getting material list").build();
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/material")
    public ResponseEntity<?> addMaterial(@RequestBody Material material) {
        try {
            log.info("Adding material with ID: {}", material.getId());
            if (materialRepository.findByTitle(material.getTitle()).isPresent()) {
                throw new RuntimeException("Material with this title already exists");
            }
            materialService.addMaterial(material);
            log.info("Material added successfully with ID: {}", material.getId());
            ServiceResponse response = ServiceResponse.builder().message("Material added successfully").build();
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Validation error adding material: {}", e.getMessage());
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error adding material : " + material.getTitle()).build();
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/updateMaterial")
    public ResponseEntity<?> updateMaterial(@RequestBody Material material) {
        try {
            if (materialRepository.findByTitle(material.getTitle()).isEmpty()) {
                throw new RuntimeException("Material with this title not exists");
            }
            materialService.updateMaterial(material);
            ServiceResponse response = ServiceResponse.builder().message("Material updated successfully").build();
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error updating material : " + material.getTitle()).build();
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/deleteMaterial")
    public ResponseEntity<?> deleteMaterial(@RequestBody Material material) {
        try {
            if (materialRepository.findByTitle(material.getTitle()).isEmpty()) {
                ServiceResponse errorResponse = ServiceResponse.builder().message("Material with this title not exists").build();
                return ResponseEntity.badRequest().body(errorResponse);
            }
            materialService.deleteMaterial(material.getId());
            ServiceResponse response = ServiceResponse.builder().message("Material deleted successfully").build();
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error deleting material : " + material.getTitle()).build();
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/quotations")
    public ResponseEntity<?> getAllQuotations(@RequestParam(defaultValue = "0") int offset, 
                                             @RequestParam(defaultValue = "10") int size,
                                             @RequestParam(defaultValue = "id") String sortBy) {
        try {
            log.info("Getting all quotations with pagination: offset={}, size={}, sortBy={}", offset, size, sortBy);
            PagedUserResponse<Quotation> response = quotationService.findAllQuotations(offset, size, sortBy);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting all quotations: {}", e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error getting all quotations").build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

}
