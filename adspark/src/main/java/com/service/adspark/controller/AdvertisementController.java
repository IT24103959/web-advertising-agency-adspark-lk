package com.service.adspark.controller;

import com.service.adspark.dto.response.advertisementmanagement.AdvertisementResponse;
import com.service.adspark.dto.response.advertisementmanagement.AdvertisementSummaryResponse;
import com.service.adspark.dto.request.advertisementmanagement.CreateAdvertisementRequest;
import com.service.adspark.service.AdvertisementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/adverts")
@RequiredArgsConstructor
@Slf4j
public class AdvertisementController {

    private final AdvertisementService advertService;

    /**
     * Create a new advert
     * POST /api/adverts
     */
    @PostMapping
    public ResponseEntity<?> createAdvert(@Valid @RequestBody CreateAdvertisementRequest request,
                                          Authentication authentication) {
        try {
            log.info("Request to create advert: {} by user: {}", request.getTitle(), authentication.getName());

            AdvertisementResponse advert = advertService.createAdvert(request, authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(advert);

        } catch (RuntimeException e) {
            log.error("Error creating advert: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error creating advert", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred while creating the advert");
        }
    }

    /**
     * Get advert by ID
     * GET /api/adverts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAdvert(@PathVariable Long id, Authentication authentication) {
        try {
            log.info("Request to get advert with ID: {} by user: {}", id, authentication.getName());

            AdvertisementResponse advert = advertService.getAdvertById(id, authentication.getName());
            return ResponseEntity.ok(advert);

        } catch (RuntimeException e) {
            log.error("Error getting advert: {}", e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: " + e.getMessage());
            } else {
                return ResponseEntity.badRequest().body("Error: " + e.getMessage());
            }
        } catch (Exception e) {
            log.error("Unexpected error getting advert", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred while retrieving the advert");
        }
    }

    /**
     * Delete advert by ID
     * DELETE /api/adverts/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAdvert(@PathVariable Long id, Authentication authentication) {
        try {
            log.info("Request to delete advert with ID: {} by user: {}", id, authentication.getName());

            advertService.deleteAdvert(id, authentication.getName());
            return ResponseEntity.ok().body("Advert deleted successfully");

        } catch (RuntimeException e) {
            log.error("Error deleting advert: {}", e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: " + e.getMessage());
            } else if (e.getMessage().contains("Cannot delete")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Error: " + e.getMessage());
            } else {
                return ResponseEntity.badRequest().body("Error: " + e.getMessage());
            }
        } catch (Exception e) {
            log.error("Unexpected error deleting advert", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred while deleting the advert");
        }
    }

    @GetMapping("/my-summary")
    public ResponseEntity<?> getMyAdvertisementSummaries(Authentication authentication) {
        try {
            log.info("Request to get advertisement summaries for user: {}", authentication.getName());

            List<AdvertisementSummaryResponse> summaries = advertService
                    .getUserAdvertisementSummaries(authentication.getName());

            log.info("Found {} advertisement summaries for user: {}", summaries.size(), authentication.getName());
            return ResponseEntity.ok(summaries);

        } catch (RuntimeException e) {
            log.error("Error getting advertisement summaries: {}", e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: " + e.getMessage());
            } else {
                return ResponseEntity.badRequest().body("Error: " + e.getMessage());
            }
        } catch (Exception e) {
            log.error("Unexpected error getting advertisement summaries", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred while getting advertisement summaries");
        }
    }
    @GetMapping("/public")
    public ResponseEntity<?> getPublicAdvertisements() {
        try {
            log.info("Request to get all public advertisements");

            List<AdvertisementResponse> advertisements = advertService.getPublicAdvertisements();

            log.info("Found {} public advertisements", advertisements.size());
            return ResponseEntity.ok(advertisements);

        } catch (Exception e) {
            log.error("Unexpected error getting public advertisements", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred while getting public advertisements");
        }
    }

}