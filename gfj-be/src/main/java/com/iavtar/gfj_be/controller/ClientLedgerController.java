package com.iavtar.gfj_be.controller;

import com.iavtar.gfj_be.model.request.CreateClientLedgerRequest;
import com.iavtar.gfj_be.model.response.ClientLedgerSummaryResponse;
import com.iavtar.gfj_be.service.ClientLedgerService;
import com.iavtar.gfj_be.utility.ValidationUtil;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/client-ledger")
public class ClientLedgerController {

    @Autowired
    private ClientLedgerService clientLedgerService;

    @Autowired
    private ValidationUtil validationUtil;

    @PostMapping("/transaction")
    public ResponseEntity<?> createTransaction(@Valid @RequestBody CreateClientLedgerRequest request,
                                              BindingResult result) {
        ResponseEntity<?> errorMap = validationUtil.validate(result);
        if (errorMap != null) {
            return errorMap;
        }
        return clientLedgerService.createTransaction(request);
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<ClientLedgerSummaryResponse> getClientLedger(
            @PathVariable Long clientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return clientLedgerService.getClientLedger(clientId, page, size);
    }

    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<?> getTransaction(@PathVariable String transactionId) {
        return clientLedgerService.getTransaction(transactionId);
    }

    @DeleteMapping("/transaction/{transactionId}")
    public ResponseEntity<?> deleteTransaction(@PathVariable String transactionId) {
        return clientLedgerService.deleteTransaction(transactionId);
    }

    @GetMapping("/client/{clientId}/balance")
    public ResponseEntity<?> getClientBalance(@PathVariable Long clientId) {
        return clientLedgerService.getClientBalance(clientId);
    }
}
