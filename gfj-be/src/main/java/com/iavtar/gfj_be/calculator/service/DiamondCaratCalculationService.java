package com.iavtar.gfj_be.calculator.service;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

public interface DiamondCaratCalculationService {
    ResponseEntity<?> calculate(MultipartFile file);
}
