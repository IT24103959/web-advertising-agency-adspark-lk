package com.service.adspark.controller;

import com.service.adspark.dto.request.usermanagement.*;
import com.service.adspark.dto.response.usermanagement.*;
import com.service.adspark.service.UserService;
import com.service.adspark.model.enums.UserRole;
import io.swagger.v3.oas.annotations.Operation;
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
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Management", description = "APIs for managing internal and external users")
public class UserController {

    private final UserService userService;

    @PostMapping("/internal")
    @Operation(summary = "Create Internal User", description = "Create a new internal user (employee)")
    public ResponseEntity<?> createInternalUser(@Valid @RequestBody InternalUserCreateRequest request) {
        try {
            log.info("Received request to create internal user: {}", request.getUsername());
            UserResponse user = userService.createInternalUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (RuntimeException e) {
            log.error("Error creating internal user: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error creating internal user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred");
        }
    }

    @PostMapping("/external")
    @Operation(summary = "Create External User", description = "Create a new external user (client)")
    public ResponseEntity<?> createExternalUser(@Valid @RequestBody ExternalUserCreateRequest request) {
        try {
            log.info("Received request to create external user: {}", request.getUsername());
            UserResponse user = userService.createExternalUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (RuntimeException e) {
            log.error("Error creating external user: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error creating external user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred");
        }
    }

    @PostMapping("/login")
    @Operation(summary = "User Login", description = "Authenticate user credentials")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody UserLoginRequest request) {
        try {
            log.info("Received login request for user: {}", request.getUsername());
            LoginResponse response = userService.authenticateUser(request);

            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (Exception e) {
            log.error("Unexpected error during login", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(LoginResponse.failure("An unexpected error occurred"));
        }
    }

    @GetMapping("/me")
    @Operation(summary = "Get Current User Details", description = "Get details of the currently authenticated user (requires basic authentication)")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            String username = authentication.getName();
            log.info("Received request to get user details for: {}", username);

            Optional<UserResponse> user = userService.getUserByUsername(username);
            if (user.isPresent()) {
                return ResponseEntity.ok(user.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }
        } catch (Exception e) {
            log.error("Unexpected error getting user details", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred");
        }
    }

    @GetMapping("/financial-team")
    @Operation(summary = "Get Financial Team Members", description = "Get all financial team members data (requires authentication)")
    public ResponseEntity<?> getFinancialTeamMembers(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
            }

            String username = authentication.getName();
            log.info("Received request to get financial team members by user: {}", username);

            List<UserResponse> financialTeamMembers = userService.getFinancialTeamMembers();
            return ResponseEntity.ok(financialTeamMembers);

        } catch (Exception e) {
            log.error("Unexpected error getting financial team members", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred");
        }
    }

}