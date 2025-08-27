package com.iavtar.gfj_be.controller;

import com.iavtar.gfj_be.model.request.UpdateShippingTrackingRequest;
import com.iavtar.gfj_be.service.ShippingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/shipping")
public class ShippingController {

    @Autowired
    private ShippingService shippingService;

    @PostMapping("/markForShipping")
    public ResponseEntity<?> markQuotationsForShipping(@RequestBody List<String> quotations) {
        return shippingService.markQuotationsForShipping(quotations);
    }

    @GetMapping("/allShipping")
    public ResponseEntity<?> getAllShipping(@RequestParam(defaultValue = "0") int offset,
                                            @RequestParam(defaultValue = "10") int size) {
        return shippingService.getAllShipping(offset, size);
    }

    @PostMapping("/addTrackingId")
    public ResponseEntity<?> addTrackingId(@RequestParam String shippingId, 
                                          @RequestParam String trackingId) {
        return shippingService.addTrackingId(shippingId, trackingId);
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateTrackingStatus(@RequestBody UpdateShippingTrackingRequest request) {
        return shippingService.updateTrackingStatus(request);
    }

}
