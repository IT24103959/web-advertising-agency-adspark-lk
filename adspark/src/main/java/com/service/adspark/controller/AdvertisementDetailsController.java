package com.service.adspark.controller;

import com.service.adspark.dto.request.advertisementdetails.AdvertisementDetailsCreateRequest;
import com.service.adspark.dto.response.advertisementdetails.AdvertisementDetailsResponse;
import com.service.adspark.dto.response.usermanagement.UserResponse;
import com.service.adspark.model.enums.UserRole;
import com.service.adspark.service.AdvertisementDetailsService;
import com.service.adspark.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/advert-details")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Advertisement Details Management", description = "APIs for managing advertisement details submitted by clients")
public class AdvertisementDetailsController {

    private final AdvertisementDetailsService advertisementDetailsService;
    private final UserService userService;

    @PostMapping
    @Operation(summary = "Create Advertisement Details", description = "Create new advertisement details (Clients only)")
    public ResponseEntity<?> createAdvertisementDetails(
            @Valid @RequestBody AdvertisementDetailsCreateRequest request,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            String username = authentication.getName();

            // Check if user exists and is a CLIENT
            Optional<UserResponse> userOpt = userService.getUserByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not found");
            }

            UserResponse user = userOpt.get();
            if (user.getRole() != UserRole.CLIENT) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Only clients can create advertisement details");
            }

            log.info("Creating advertisement details for client: {}", username);

            AdvertisementDetailsResponse response = advertisementDetailsService.createAdvertisementDetails(request, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            log.error("Error creating advertisement details: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error creating advertisement details", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred");
        }
    }

    @GetMapping
    @Operation(summary = "Get All Advertisement Details", description = "Get all advertisement details (Graphic Designers only)")
    public ResponseEntity<?> getAllAdvertisementDetails(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            String username = authentication.getName();

            // Check if user exists and is a GRAPHIC_DESIGNER
            Optional<UserResponse> userOpt = userService.getUserByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not found");
            }

            UserResponse user = userOpt.get();
            if (user.getRole() != UserRole.GRAPHIC_DESIGNER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Only graphic designers can view all advertisement details");
            }

            log.info("Fetching all advertisement details for graphic designer: {}", username);

            List<AdvertisementDetailsResponse> response = advertisementDetailsService.getAllAdvertisementDetails();
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching advertisement details", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred");
        }
    }

    @GetMapping("/health")
    @Operation(summary = "Health Check", description = "Check if the advertisement details service is running")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Advertisement details service is running");
    }
}