package com.iavtar.gfj_be.service;

import com.iavtar.gfj_be.model.request.CreateClientLedgerRequest;
import com.iavtar.gfj_be.model.response.ClientLedgerResponse;
import com.iavtar.gfj_be.model.response.ClientLedgerSummaryResponse;
import org.springframework.http.ResponseEntity;

public interface ClientLedgerService {
    
    ResponseEntity<?> createTransaction(CreateClientLedgerRequest request);
    
    ResponseEntity<ClientLedgerSummaryResponse> getClientLedger(Long clientId, int page, int size);
    
    ResponseEntity<?> getTransaction(String transactionId);
    
    ResponseEntity<?> deleteTransaction(String transactionId);
    
    ResponseEntity<?> getClientBalance(Long clientId);
}
