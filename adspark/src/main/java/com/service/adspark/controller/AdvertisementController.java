package com.service.adspark.controller;

import com.service.adspark.dto.response.advertisementmanagement.AdvertisementResponse;
import com.service.adspark.dto.response.advertisementmanagement.AdvertisementSummaryResponse;
import com.service.adspark.dto.request.advertisementmanagement.CreateAdvertisementRequest;
import com.service.adspark.dto.response.usermanagement.UserResponse;
import com.service.adspark.model.enums.UserRole;
import com.service.adspark.service.UserService;
import com.service.adspark.service.AdvertisementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/adverts")
@RequiredArgsConstructor
@Slf4j
public class AdvertisementController {

    private final AdvertisementService advertService;
    private final UserService userService;

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


    @GetMapping("/pending-approval")
    public ResponseEntity<?> getPendingApprovalAdverts(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            String username = authentication.getName();

            // Check if user exists and is a MARKETING_MANAGER
            Optional<UserResponse> userOpt = userService.getUserByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not found");
            }

            UserResponse user = userOpt.get();
            if (user.getRole() != UserRole.MARKETING_MANAGER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Only Marketing Managers can view pending approval advertisements");
            }

            log.info("Request to get pending approval advertisements by marketing manager: {}", username);

            List<AdvertisementResponse> pendingAdverts = advertService.getPendingApprovalAdverts(username);
            return ResponseEntity.ok(pendingAdverts);

        } catch (RuntimeException e) {
            log.error("Error getting pending approval advertisements: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error getting pending approval advertisements", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred while getting pending approval advertisements");
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveAdvertisement(@PathVariable Long id, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            String username = authentication.getName();

            // Check if user exists and is a MARKETING_MANAGER
            Optional<UserResponse> userOpt = userService.getUserByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not found");
            }

            UserResponse user = userOpt.get();
            if (user.getRole() != UserRole.MARKETING_MANAGER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Only Marketing Managers can approve advertisements");
            }

            log.info("Request to approve advertisement {} by marketing manager: {}", id, username);

            AdvertisementResponse approvedAdvert = advertService.approveAdvertisement(id, username);
            return ResponseEntity.ok(approvedAdvert);

        } catch (RuntimeException e) {
            log.error("Error approving advertisement: {}", e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else {
                return ResponseEntity.badRequest().body("Error: " + e.getMessage());
            }
        } catch (Exception e) {
            log.error("Unexpected error approving advertisement", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred while approving the advertisement");
        }
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<?> getPublicAdvertisement(@PathVariable Long id) {
        try {
            log.info("Request to get public advertisement details for ID: {}", id);

            AdvertisementResponse advertisement = advertService.getAdvertByIdPublic(id);
            return ResponseEntity.ok(advertisement);

        } catch (RuntimeException e) {
            log.error("Error getting public advertisement: {}", e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("not available for public viewing")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: " + e.getMessage());
            } else {
                return ResponseEntity.badRequest().body("Error: " + e.getMessage());
            }
        } catch (Exception e) {
            log.error("Unexpected error getting public advertisement", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred while retrieving the advertisement");
        }
    }


}