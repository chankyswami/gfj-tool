package com.iavtar.gfj_be.exception;

import com.iavtar.gfj_be.model.response.ServiceResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.WebRequest;

@ControllerAdvice
@RestController
public class ServiceExceptionHandler {

    @ExceptionHandler
    public final ResponseEntity<?> handleLedgerException(LedgerException exception, WebRequest request) {
        return new ResponseEntity<>(
                ServiceResponse.builder()
                        .message("Error ")
                        .build(),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

}
