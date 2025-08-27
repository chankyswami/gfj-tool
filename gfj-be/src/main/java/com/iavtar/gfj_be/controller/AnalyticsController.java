package com.iavtar.gfj_be.controller;

import com.iavtar.gfj_be.model.response.ServiceResponse;
import com.iavtar.gfj_be.service.AnalyticsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardAnalytics() {
        try {
            log.info("Getting dashboard analytics");
            Map<String, Object> analytics = analyticsService.getDashboardAnalytics();
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            log.error("Error getting dashboard analytics: {}", e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder()
                    .message("Error getting dashboard analytics")
                    .build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/quotations/analytics")
    public ResponseEntity<?> getQuotationAnalytics(@RequestParam(required = false) String period) {
        try {
            log.info("Getting quotation analytics for period: {}", period);
            Map<String, Object> analytics = analyticsService.getQuotationAnalytics(period);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            log.error("Error getting quotation analytics: {}", e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder()
                    .message("Error getting quotation analytics")
                    .build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/financial/analytics")
    public ResponseEntity<?> getFinancialAnalytics(@RequestParam(required = false) String period) {
        try {
            log.info("Getting financial analytics for period: {}", period);
            Map<String, Object> analytics = analyticsService.getFinancialAnalytics(period);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            log.error("Error getting financial analytics: {}", e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder()
                    .message("Error getting financial analytics")
                    .build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/clients/analytics")
    public ResponseEntity<?> getClientAnalytics() {
        try {
            log.info("Getting client analytics");
            Map<String, Object> analytics = analyticsService.getClientAnalytics();
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            log.error("Error getting client analytics: {}", e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder()
                    .message("Error getting client analytics")
                    .build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/agents/analytics")
    public ResponseEntity<?> getAgentAnalytics() {
        try {
            log.info("Getting agent analytics");
            Map<String, Object> analytics = analyticsService.getAgentAnalytics();
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            log.error("Error getting agent analytics: {}", e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder()
                    .message("Error getting agent analytics")
                    .build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/trends")
    public ResponseEntity<?> getBusinessTrends(@RequestParam(defaultValue = "12") int months) {
        try {
            log.info("Getting business trends for last {} months", months);
            Map<String, Object> trends = analyticsService.getBusinessTrends(months);
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            log.error("Error getting business trends: {}", e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder()
                    .message("Error getting business trends")
                    .build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/performance/summary")
    public ResponseEntity<?> getPerformanceSummary() {
        try {
            log.info("Getting performance summary");
            Map<String, Object> summary = analyticsService.getPerformanceSummary();
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("Error getting performance summary: {}", e.getMessage(), e);
            ServiceResponse errorResponse = ServiceResponse.builder()
                    .message("Error getting performance summary")
                    .build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
} 