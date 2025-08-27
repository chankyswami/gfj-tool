package com.iavtar.gfj_be.service;

import com.iavtar.gfj_be.model.request.SignInRequest;
import org.springframework.http.ResponseEntity;

public interface AuthService {
    ResponseEntity<?> signIn(SignInRequest request);
}
