package com.iavtar.gfj_be.controller;

import com.iavtar.gfj_be.entity.Client;
import com.iavtar.gfj_be.entity.Quotation;
import com.iavtar.gfj_be.model.request.ClientRequest;
import com.iavtar.gfj_be.model.request.UpdateFinalQuotationRequest;
import com.iavtar.gfj_be.model.response.PagedUserResponse;
import com.iavtar.gfj_be.model.response.QuotationCreationResponse;
import com.iavtar.gfj_be.model.response.ServiceResponse;
import com.iavtar.gfj_be.service.AgentService;
import com.iavtar.gfj_be.service.QuotationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/agent")
public class AgentController {

    @Autowired
    private AgentService agentService;

    @Autowired
    private QuotationService quotationService;

    @PostMapping("/client")
    public ResponseEntity<?> createClient(@RequestBody ClientRequest request) {
        try {
            log.info("Creating new client with clientName: {}", request.getClientName());
            if (agentService.existsByClientName(request.getClientName())) {
                log.error("Validation failed - client name already exists: {}", request.getClientName());
                ServiceResponse errorResponse = ServiceResponse.builder().message("Client name already exists").build();
                return ResponseEntity.badRequest().body(errorResponse);
            }
            if (agentService.existsByEmail(request.getEmail())) {
                log.error("Validation failed - email already exists: {}", request.getEmail());
                ServiceResponse errorResponse = ServiceResponse.builder().message("Email already exists").build();
                return ResponseEntity.badRequest().body(errorResponse);
            }
            if (agentService.existsByPhoneNumber(request.getPhoneNumber())) {
                log.error("Validation failed - phone number already exists: {}", request.getPhoneNumber());
                ServiceResponse errorResponse = ServiceResponse.builder().message("Phone number already exists").build();
                return ResponseEntity.badRequest().body(errorResponse);
            }
            Client createdClient = agentService.createClient(request);
            log.info("Client created successfully with ID: {}", createdClient.getId());
            ServiceResponse response = ServiceResponse.builder().message("Client created successfully").build();
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Validation error creating client: {}", e.getMessage());
            ServiceResponse errorResponse = ServiceResponse.builder().message(e.getMessage()).build();
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("Error creating client: {}", e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error creating client: " + e.getMessage()).build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/client")
    public ResponseEntity<?> getClientByName(@RequestParam("clientName") String clientName) {
        try {
            log.info("Getting client by name: {}", clientName);
            Client client = agentService.getClientByName(clientName);
            if (client == null) {
                ServiceResponse errorResponse = ServiceResponse.builder().message("Client not found: " + clientName).build();
                return ResponseEntity.internalServerError().body(errorResponse);
            }
            return ResponseEntity.ok(client);
        } catch (Exception e) {
            log.error("Error getting client by name: {}", e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error getting client: " + clientName).build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/clients")
    public ResponseEntity<?> getMyClients(@RequestParam("agentId") Long agentId, @RequestParam(defaultValue = "0") int offset,
                                          @RequestParam(defaultValue = "10") int size, @RequestParam(defaultValue = "id") String sortBy) {
        try {
            log.info("Getting clients for agent: {} with pagination: offset={}, size={}, sortBy={}", agentId, offset, size, sortBy);
            PagedUserResponse<Client> response = agentService.getClientsByAgent(agentId, offset, size, sortBy);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting clients for agent {}: {}", agentId, e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error getting clients for agent").build();
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
                ServiceResponse errorResponse = ServiceResponse.builder().message("Client not found").build();
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            Client updatedClient = agentService.updateClient(request);
            log.info("Client updated successfully with ID: {}", updatedClient.getId());
            ServiceResponse response = ServiceResponse.builder().message("Client updated successfully").build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating client: {}", e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error updating client: " + e.getMessage()).build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/createQuotation")
    public ResponseEntity<?> createQuotation(@RequestBody Quotation request) {
        try {
            log.info("Creating quotation for agent: {}", request.getId());
            Quotation createdQuotation = quotationService.createQuotation(request);
            log.info("Quotation created successfully with ID: {}", createdQuotation.getId());
            return ResponseEntity.ok(QuotationCreationResponse.builder().quotationId(createdQuotation.getQuotationId()).build());
        } catch (Exception e) {
            log.error("Error creating quotation: {}", e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error creating quotation").build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/updateQuotation")
    public ResponseEntity<?> updateQuotation(@RequestBody Quotation request) {
        try {
            log.info("Updating quotation for agent: {}", request.getId());
            Quotation updateQuotation = quotationService.updateQuotation(request);
            log.info("Quotation updated successfully with ID: {}", updateQuotation.getId());
            ServiceResponse response = ServiceResponse.builder().message("Quotation updated successfully").build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating quotation: {}", e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error updating quotation").build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/createFinalQuotation")
    public ResponseEntity<?> createFinalQuotation(@RequestParam("quotationId") String quotationId) {
        try {
            log.info("Creating final quotation for quotation: {}", quotationId);
            ResponseEntity<?> response = quotationService.createFinalQuotation(quotationId);
            log.info("Created final quotation created for quotation with ID: {}", quotationId);
            return response;
        } catch (Exception e) {
            log.error("Error creating quotation: {}", e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error creating final quotation").build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/updateFinalQuotation")
    public ResponseEntity<?> updateFinalQuotation(@RequestBody UpdateFinalQuotationRequest request) {
        try {
            log.info("Updating final quotation with ID: {}", request.getFinalQuotationId());
            log.info("final quotation updated successfully with ID: {}", request.getFinalQuotationId());
            return quotationService.updateFinalQuotation(request);
        } catch (Exception e) {
            log.error("Error updating quotation: {}", e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error updating quotation").build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @DeleteMapping("/deleteQuotation")
    public ResponseEntity<?> deleteQuotation(@RequestParam("quotationId") String quotationId) {
        try {
            log.info("Deleting quotation for agent: {}", quotationId);
            quotationService.deleteQuotation(quotationId);
            log.info("Quotation deleted successfully with ID: {}", quotationId);
            ServiceResponse response = ServiceResponse.builder().message("Quotation deleted successfully").build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting quotation: {}", e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error deleting quotation").build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/getQuotation")
    public ResponseEntity<?> getQuotation(@RequestParam("id") Long id) {
        try {
            log.info("Getting quotation with ID: {}", id);
            Quotation quotation = quotationService.findQuotationById(id);
            if (quotation == null) {
                ServiceResponse errorResponse = ServiceResponse.builder()
                        .message("Quotation not found with ID: " + id)
                        .build();
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            return ResponseEntity.ok(quotation);
        } catch (Exception e) {
            log.error("Error getting quotation: {}", e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error getting quotation").build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/getAllQuotationsByClient")
    public ResponseEntity<?> getAllQuotationsByClient(@RequestParam("clientId") Long clientId,
                                                      @RequestParam(defaultValue = "0") int offset,
                                                      @RequestParam(defaultValue = "10") int size,
                                                      @RequestParam(defaultValue = "id") String sortBy) {
        try {
            log.info("Getting all quotations for client: {}", clientId);
            PagedUserResponse<Quotation> quotations = quotationService.findAllQuotationsByClient(clientId, offset, size, sortBy);
            return ResponseEntity.ok(quotations);
        } catch (Exception e) {
            log.error("Error getting quotations for client {}: {}", clientId, e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error getting quotations for client").build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/getAllQuotationsByAgent")
    public ResponseEntity<?> getAllQuotationsByAgent(@RequestParam("agentId") Long agentId,
                                                     @RequestParam(defaultValue = "0") int offset,
                                                     @RequestParam(defaultValue = "10") int size,
                                                     @RequestParam(defaultValue = "id") String sortBy) {
        try {
            log.info("Getting all quotations for agent: {}", agentId);
            PagedUserResponse<Quotation> quotations = quotationService.findAllQuotationsByAgent(agentId, offset, size, sortBy);
            return ResponseEntity.ok(quotations);
        } catch (Exception e) {
            log.error("Error getting quotations for agent {}: {}", agentId, e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder()
                    .message("Error getting quotations for agent")
                    .build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/getAllQuotationsByClientAndAgent")
    public ResponseEntity<?> getAllQuotationsByClientAndAgent(@RequestParam("clientId") Long clientId,
                                                              @RequestParam("agentId") Long agentId,
                                                              @RequestParam(defaultValue = "0") int offset,
                                                              @RequestParam(defaultValue = "10") int size,
                                                              @RequestParam(defaultValue = "id") String sortBy) {
        try {
            log.info("Getting all quotations for client: {} and agent: {}", clientId, agentId);
            PagedUserResponse<Quotation> quotations = quotationService.findAllQuotationsByClientAndAgent(clientId, agentId, offset, size, sortBy);
            return ResponseEntity.ok(quotations);
        } catch (Exception e) {
            log.error("Error getting quotations for client {} and agent {}: {}", clientId, agentId, e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder()
                    .message("Error getting quotations for client and agent")
                    .build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/quotation/upload")
    public ResponseEntity<?> uploadQuotationImage(@RequestParam("file") MultipartFile file,
                                                  @RequestParam("quotationId") String quotationId) {
        try {
            return quotationService.uploadQuotationImage(file, quotationId);
        } catch (Exception e) {
            log.error("Error uploading quotations image: {}", e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error uploading quotations image").build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }

    }

    @PostMapping("/finalQuotation/upload")
    public ResponseEntity<?> uploadFinalQuotationImage(@RequestParam("file") MultipartFile file,
                                                       @RequestParam("quotationId") String quotationId) {
        try {
            return quotationService.uploadFinalQuotationImage(file, quotationId);
        } catch (Exception e) {
            log.error("Error uploading quotations image: {}", e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder().message("Error uploading quotations image").build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }

    }

}

