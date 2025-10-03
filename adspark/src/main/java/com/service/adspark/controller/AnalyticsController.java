package com.service.adspark.controller;

import com.service.adspark.dto.request.analyticsmanagement.TrackEventRequest;
import com.service.adspark.dto.request.analyticsmanagement.MetricsRequest;
import com.service.adspark.dto.response.analyticsmanagement.AnalyticsResponse;
import com.service.adspark.dto.response.analyticsmanagement.DashboardMetricsResponse;
import com.service.adspark.model.enums.MetricType;
import com.service.adspark.service.AnalyticsService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@Slf4j
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    // Endpoint 1: Track events (clicks, views, impressions)
    @PostMapping("/track-event")
    public ResponseEntity<?> trackEvent(@Valid @RequestBody TrackEventRequest request, Principal principal) {
        try {
            log.info("Tracking {} event for advertisement {} by user: {}",
                    request.getEventType(), request.getAdvertisementId(),
                    principal != null ? principal.getName() : "anonymous");

            analyticsService.trackEvent(request);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Event tracked successfully",
                            "eventType", request.getEventType(),
                            "advertisementId", request.getAdvertisementId()));

        } catch (IllegalArgumentException e) {
            log.warn("Invalid request for tracking event: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to track event: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to track event"));
        }
    }

    // Endpoint 2: Get metrics for specific advertisement
    @GetMapping("/metrics/{advertisementId}")
    public ResponseEntity<?> getAdvertisementMetrics(@PathVariable Long advertisementId,
                                                     @RequestParam(required = false, defaultValue = "MONTHLY") String metricType,
                                                     @RequestParam(required = false) String startDate,
                                                     @RequestParam(required = false) String endDate,
                                                     Principal principal) {
        try {
            log.info("Getting metrics for advertisement {} by user: {}", advertisementId, principal.getName());

            // Build metrics request
            MetricsRequest request = new MetricsRequest();
            try {
                request.setMetricType(MetricType.valueOf(metricType.toUpperCase()));
            } catch (IllegalArgumentException e) {
                request.setMetricType(MetricType.MONTHLY);
            }

            // Parse dates if provided
            if (startDate != null && !startDate.isEmpty()) {
                try {
                    request.setStartDate(java.time.LocalDateTime.parse(startDate));
                } catch (Exception e) {
                    log.warn("Invalid start date format: {}", startDate);
                }
            }

            if (endDate != null && !endDate.isEmpty()) {
                try {
                    request.setEndDate(java.time.LocalDateTime.parse(endDate));
                } catch (Exception e) {
                    log.warn("Invalid end date format: {}", endDate);
                }
            }

            AnalyticsResponse metrics = analyticsService.getAdvertisementMetrics(advertisementId, request);
            return ResponseEntity.ok(metrics);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid request for advertisement metrics: {}", e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to get advertisement metrics: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get advertisement metrics"));
        }
    }

    // Endpoint 3: Get dashboard metrics overview
    @GetMapping("/dashboard-metrics")
    public ResponseEntity<?> getDashboardMetrics(Principal principal) {
        try {
            log.info("Getting dashboard metrics by user: {}", principal.getName());

            DashboardMetricsResponse dashboardMetrics = analyticsService.getDashboardMetrics();
            return ResponseEntity.ok(dashboardMetrics);

        } catch (Exception e) {
            log.error("Failed to get dashboard metrics: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get dashboard metrics"));
        }
    }

    // Additional endpoint: Get metrics for multiple advertisements
    @PostMapping("/bulk-metrics")
    public ResponseEntity<?> getBulkMetrics(@Valid @RequestBody MetricsRequest request, Principal principal) {
        try {
            log.info("Getting bulk metrics by user: {}", principal.getName());

            // This could be extended to handle multiple advertisement IDs
            // For now, just return error as not implemented
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                    .body(Map.of("error", "Bulk metrics endpoint not yet implemented"));

        } catch (Exception e) {
            log.error("Failed to get bulk metrics: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get bulk metrics"));
        }
    }
}