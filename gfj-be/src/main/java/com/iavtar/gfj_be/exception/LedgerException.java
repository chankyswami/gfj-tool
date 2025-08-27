package com.iavtar.gfj_be.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class LedgerException extends RuntimeException{

    public LedgerException(String message) {
        super(message);
    }

}
