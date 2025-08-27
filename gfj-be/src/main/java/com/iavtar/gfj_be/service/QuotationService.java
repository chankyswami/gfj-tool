package com.iavtar.gfj_be.service;

import com.iavtar.gfj_be.entity.FinalQuotation;
import com.iavtar.gfj_be.entity.Quotation;
import com.iavtar.gfj_be.model.request.UpdateFinalQuotationRequest;
import com.iavtar.gfj_be.model.response.PagedUserResponse;
import com.iavtar.gfj_be.model.response.ServiceResponse;
import com.iavtar.gfj_be.repository.FinalQuotationRepository;
import com.iavtar.gfj_be.repository.QuotationRepository;
import com.iavtar.gfj_be.utility.CommonUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class QuotationService {
    @Autowired
    private QuotationRepository quotationRepository;
    @Autowired
    private CommonUtil commonUtil;

    @Autowired
    private QuotationIdGeneratorService idGeneratorService;

    @Autowired
    private FinalQuotationRepository finalQuotationRepository;

    public Quotation createQuotation(Quotation quotation) {
        return quotationRepository.save(
                Quotation.builder()
                        .quotationId(idGeneratorService.generateId())
                        .description(quotation.getDescription())
                        .data(quotation.getData())
                        .price(quotation.getPrice())
                        .agentId(quotation.getAgentId())
                        .clientId(quotation.getClientId())
                        .quotationStatus(quotation.getQuotationStatus())
                        .updatedAt(LocalDateTime.now())
                        .build());
    }

    public Quotation updateQuotation(Quotation quotation) {
        Optional<Quotation> existingQuotationOptional = quotationRepository.findByQuotationId(quotation.getQuotationId());
        if (existingQuotationOptional.isEmpty()) {
            log.info("Quotation with quotationId {} not found", quotation.getQuotationId());
            throw new IllegalArgumentException("Quotation with quotationId " + quotation.getQuotationId() + " not found");
        }
        Quotation existingQuotation = existingQuotationOptional.get();
        if (quotation.getClientId() != null) {
            existingQuotation.setClientId(quotation.getClientId());
        }
        if (quotation.getAgentId() != null) {
            existingQuotation.setAgentId(quotation.getAgentId());
        }
        if (quotation.getData() != null) {
            existingQuotation.setData(quotation.getData());
        }
        if (quotation.getPrice() != null) {
            existingQuotation.setPrice(quotation.getPrice());
        }
        if (quotation.getQuotationStatus() != null) {
            existingQuotation.setQuotationStatus(quotation.getQuotationStatus());
        }
        if (quotation.getDescription() != null) {
            existingQuotation.setDescription(quotation.getDescription());
        }
        existingQuotation.setUpdatedAt(LocalDateTime.now());
        return quotationRepository.save(existingQuotation);
    }

    public void deleteQuotation(String quotationId) {
        log.info("Deleting quotation with quotationId {}", quotationId);
        Optional<Quotation> existingQuotationOptional = quotationRepository.findByQuotationId(quotationId);
        if (existingQuotationOptional.isEmpty()) {
            log.info("Quotation with quotationId {} not found", quotationId);
            throw new IllegalArgumentException("Quotation with quotationId " + quotationId + " not found");
        }
        quotationRepository.delete(existingQuotationOptional.get());
    }

    public Quotation findQuotationById(Long id) {
        log.info("Finding quotation with id {}", id);
        Optional<Quotation> quotationOptional = quotationRepository.findById(id);
        if (quotationOptional.isEmpty()) {
            log.info("Quotation with id {} not found", id);
            throw new IllegalArgumentException("Quotation with id " + id + " not found");
        }
        return quotationOptional.get();
    }

    public Quotation findQuotationByQuotationId(String quotationId) {
        log.info("Finding quotation with quotationId {}", quotationId);
        Optional<Quotation> quotationOptional = quotationRepository.findByQuotationId(quotationId);
        if (quotationOptional.isEmpty()) {
            log.info("Quotation with quotationId {} not found", quotationId);
            throw new IllegalArgumentException("Quotation with quotationId " + quotationId + " not found");
        }
        return quotationOptional.get();
    }

    public PagedUserResponse<Quotation> findAllQuotationsByClient(Long clientId, int offset, int size, String sortBy) {
        log.info("Getting all quotations for client: {}", clientId);
        return commonUtil.findAllQuotationsByClient(clientId, offset, size, sortBy);
    }

    public PagedUserResponse<Quotation> findAllQuotationsByAgent(Long agentId, int offset, int size, String sortBy) {
        log.info("Getting all quotations for agent: {}", agentId);
        return commonUtil.findAllQuotationsByAgent(agentId, offset, size, sortBy);
    }

    public PagedUserResponse<Quotation> findAllQuotationsByClientAndAgent(Long clientId, Long agentId, int offset, int size, String sortBy) {
        log.info("Getting all quotations for client: {} and agent: {}", clientId, agentId);
        return commonUtil.findAllQuotationsByClientAndAgent(clientId, agentId, offset, size, sortBy);
    }

    public PagedUserResponse<Quotation> findAllQuotations(int offset, int size, String sortBy) {
        log.info("Getting all quotations with pagination: offset={}, size={}, sortBy={}", offset, size, sortBy);
        return commonUtil.findAllQuotations(offset, size, sortBy);
    }

    public ResponseEntity<?> uploadQuotationImage(MultipartFile file, String quotationId) {
        try {
            String url = commonUtil.uploadFile(file);
            Optional<Quotation> existingQuotationOptional = quotationRepository.findByQuotationId(quotationId);
            if (existingQuotationOptional.isEmpty()) {
                log.info("Quotation with quotationId {} not found", quotationId);
                throw new IllegalArgumentException("Quotation with quotationId " + quotationId + " not found");
            }
            Quotation existingQuotation = existingQuotationOptional.get();
            existingQuotation.setImageUrl(url);
            quotationRepository.save(existingQuotation);
            return ResponseEntity.ok(url);
        } catch (Exception e) {
            log.error("Error uploading quotations image: {}", e.getMessage(), e);
            return new ResponseEntity<>(
                    ServiceResponse.builder()
                            .message("Error uploading quotations image")
                            .build(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<?> uploadFinalQuotationImage(MultipartFile file, String quotationId) {
        try {
            String url = commonUtil.uploadFile(file);
            Optional<FinalQuotation> existingQuotationOptional = finalQuotationRepository.findByFinalQuotationId(quotationId);
            if (existingQuotationOptional.isEmpty()) {
                log.info("Final Quotation with quotationId {} not found", quotationId);
                throw new IllegalArgumentException("Final Quotation with quotationId " + quotationId + " not found");
            }
            FinalQuotation existingQuotation = existingQuotationOptional.get();
            existingQuotation.setImageUrl(url);
            finalQuotationRepository.save(existingQuotation);
            return ResponseEntity.ok(url);
        } catch (Exception e) {
            log.error("Error uploading final quotations image: {}", e.getMessage(), e);
            return new ResponseEntity<>(
                    ServiceResponse.builder()
                            .message("Error uploading final quotations image")
                            .build(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<?> createFinalQuotation(String quotationId) {
        try {
            Optional<Quotation> quotation = quotationRepository.findByQuotationId(quotationId);
            if (quotation.isPresent()) {
                Quotation qt = quotation.get();
                if (qt.getQuotationStatus().equalsIgnoreCase("manufacturing complete")) {
                    List<FinalQuotation> finalQuotationList = qt.getFinalQuotations();
                    finalQuotationList.add(
                            FinalQuotation.builder()
                                    .finalQuotationId(idGeneratorService.generateId())
                                    .description(qt.getDescription())
                                    .data(qt.getData())
                                    .price(qt.getPrice())
                                    .agentId(qt.getAgentId())
                                    .clientId(qt.getClientId())
                                    .quotationStatus("final")
                                    .imageUrl(qt.getImageUrl())
                                    .shippingId(qt.getShippingId())
                                    .trackingId(qt.getTrackingId())
                                    .build()
                    );
                    quotationRepository.save(qt);
                    return new ResponseEntity<>(ServiceResponse.builder().message("final quote created!").build(), HttpStatus.OK);
                }
                return new ResponseEntity<>(ServiceResponse.builder().message("manufacturing not completed").build(), HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(ServiceResponse.builder().message("quotation not found").build(), HttpStatus.NOT_FOUND);
        } catch (Exception exception) {
            throw new RuntimeException(exception.getMessage());
        }
    }

    public ResponseEntity<?> updateFinalQuotation(UpdateFinalQuotationRequest request) {
        try {
            Optional<FinalQuotation> finalQuotation = finalQuotationRepository.findByFinalQuotationId(request.getFinalQuotationId());
            if (finalQuotation.isPresent()) {
                FinalQuotation fqt = finalQuotation.get();
                if (request.getDescription() != null) {
                    fqt.setDescription(request.getDescription());
                }
                if (request.getData() != null) {
                    fqt.setData(request.getData());
                }
                if (request.getPrice() != null) {
                    fqt.setPrice(request.getPrice());
                }
                if (request.getAgentId() != null) {
                    fqt.setAgentId(request.getAgentId());
                }
                if (request.getQuotationStatus() != null) {
                    fqt.setQuotationStatus(request.getQuotationStatus());
                }
                if (request.getTrackingId() != null) {
                    fqt.setTrackingId(request.getTrackingId());
                }
                finalQuotationRepository.save(fqt);
                return new ResponseEntity<>(ServiceResponse.builder().message("Final Quotation Updated").build(), HttpStatus.OK);
            }
            return new ResponseEntity<>(ServiceResponse.builder().message("Final Quotation Update Failed").build(), HttpStatus.BAD_REQUEST);
        } catch (Exception exception) {
            throw new RuntimeException(exception.getMessage());
        }
    }

}
