package com.service.adspark.controller;

import com.service.adspark.dto.request.paymentmanagement.CreatePaymentRequest;
import com.service.adspark.dto.request.paymentmanagement.ProcessPaymentRequest;
import com.service.adspark.dto.response.paymentmanagement.PaymentResponse;
import com.service.adspark.dto.response.paymentmanagement.PaymentSummaryResponse;
import com.service.adspark.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // Endpoint 1: Create payment (financial team only)
    @PostMapping
    public ResponseEntity<?> createPayment(@Valid @RequestBody CreatePaymentRequest createRequest,
                                           Principal principal) {
        try {
            PaymentResponse response = paymentService.createPayment(createRequest, principal.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Endpoint 2: Process payment (client only)
    @PutMapping("/{id}/pay")
    public ResponseEntity<?> processPayment(@PathVariable Long id,
                                            @Valid @RequestBody ProcessPaymentRequest processRequest, Principal principal) {
        try {
            PaymentResponse response = paymentService.processPayment(id, processRequest, principal.getName());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("unauthorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process payment"));
        }
    }

    // Endpoint 3: Get payment status (both financial team and client)
    @GetMapping("/{id}/status")
    public ResponseEntity<?> getPaymentStatus(@PathVariable Long id, Principal principal) {
        try {
            PaymentResponse response = paymentService.getPaymentStatus(id, principal.getName());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("unauthorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get payment status"));
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getPaymentSummaries(Principal principal) {
        try {
            List<PaymentSummaryResponse> summaries = paymentService.getPaymentSummaries(principal.getName());
            return ResponseEntity.ok(summaries);
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("unauthorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get payment summaries"));
        }
    }
}