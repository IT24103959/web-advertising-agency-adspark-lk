package com.service.adspark.controller;

import com.service.adspark.dto.response.assetmanagement.*;
import com.service.adspark.dto.request.assetmanagement.*;
import com.service.adspark.dto.response.usermanagement.UserResponse;
import com.service.adspark.service.AssetService;
import com.service.adspark.service.UserService;
import com.service.adspark.model.enums.UserRole;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Asset Management", description = "APIs for managing digital assets (images, videos, documents)")
public class AssetController {

    private final AssetService assetService;
    private final UserService userService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create Asset", description = "Upload and create a new digital asset (Graphic Designers only)")
    public ResponseEntity<?> createAsset(
            @Parameter(description = "Asset metadata") @Valid @ModelAttribute AssetCreateRequest request,
            @Parameter(description = "File to upload") @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            String username = authentication.getName();

            // Check if user is a Graphic Designer
            Optional<UserResponse> userOpt = userService.getUserByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not found");
            }

            UserResponse user = userOpt.get();
            if (user.getRole() != UserRole.GRAPHIC_DESIGNER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Only Graphic Designers can upload assets");
            }

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is required");
            }

            log.info("Creating asset for user: {}, file: {}", username, file.getOriginalFilename());

            AssetResponse asset = assetService.createAsset(request, file, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(asset);

        } catch (RuntimeException e) {
            log.error("Error creating asset: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error creating asset", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred");
        }
    }

    @PostMapping("/search")
    @Operation(summary = "Search Assets", description = "Search and filter assets with pagination")
    public ResponseEntity<?> searchAssets(@Valid @RequestBody AssetSearchRequest request,
                                          Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            log.info("Searching assets with criteria: {}", request);
            AssetSearchResponse response = assetService.searchAssets(request);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error searching assets", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred");
        }
    }

    @DeleteMapping("/{assetId}")
    @Operation(summary = "Delete Asset", description = "Delete an asset and its associated file (Graphic Designers only)")
    public ResponseEntity<?> deleteAsset(@PathVariable Long assetId,
                                         Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            String username = authentication.getName();

            // Check if user is a Graphic Designer
            Optional<UserResponse> userOpt = userService.getUserByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not found");
            }

            UserResponse user = userOpt.get();
            if (user.getRole() != UserRole.GRAPHIC_DESIGNER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Only Graphic Designers can delete assets");
            }

            log.info("Deleting asset {} for user: {}", assetId, username);

            boolean deleted = assetService.deleteAsset(assetId, username);
            if (deleted) {
                return ResponseEntity.ok("Asset deleted successfully");
            } else {
                return ResponseEntity.badRequest().body("Failed to delete asset");
            }

        } catch (RuntimeException e) {
            log.error("Error deleting asset: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error deleting asset", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred");
        }
    }

    @GetMapping("/{assetId}")
    @Operation(summary = "Get Asset Details", description = "Get detailed information about an asset")
    public ResponseEntity<?> getAsset(@PathVariable Long assetId,
                                      Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            Optional<AssetResponse> asset = assetService.getAssetById(assetId);
            if (asset.isPresent()) {
                return ResponseEntity.ok(asset.get());
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            log.error("Error getting asset details", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred");
        }
    }

    @GetMapping("/health")
    @Operation(summary = "Health Check", description = "Check if the asset service is running")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Asset service is running");
    }
}