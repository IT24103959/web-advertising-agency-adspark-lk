package com.service.adspark.service;

import com.service.adspark.dto.request.usermanagement.*;
import com.service.adspark.dto.response.usermanagement.*;
import com.service.adspark.model.entity.ExternalUser;
import com.service.adspark.model.entity.InternalUser;
import com.service.adspark.model.entity.User;
import com.service.adspark.model.enums.UserRole;
import com.service.adspark.model.enums.UserStatus;
import com.service.adspark.repository.ExternalUserRepository;
import com.service.adspark.repository.InternalUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final InternalUserRepository internalUserRepository;
    private final ExternalUserRepository externalUserRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Create a new internal user
     */
    public UserResponse createInternalUser(InternalUserCreateRequest request) {
        log.info("Creating internal user with username: {}", request.getUsername());

        // Check if username or email already exists
        if (internalUserRepository.existsByUsername(request.getUsername()) ||
                externalUserRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (internalUserRepository.existsByEmail(request.getEmail()) ||
                externalUserRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (internalUserRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new RuntimeException("Employee ID already exists");
        }

        // Create internal user
        InternalUser user = new InternalUser();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(request.getRole());
        user.setStatus(UserStatus.ACTIVE);
        user.setEmployeeId(request.getEmployeeId());
        user.setDepartment(request.getDepartment());
        user.setOfficeLocation(request.getOfficeLocation());
        user.setAccessLevel(request.getAccessLevel());

        InternalUser savedUser = internalUserRepository.save(user);
        log.info("Internal user created successfully with ID: {}", savedUser.getId());

        return mapToUserResponse(savedUser);
    }

    /**
     * Create a new external user (client)
     */
    public UserResponse createExternalUser(ExternalUserCreateRequest request) {
        log.info("Creating external user with username: {}", request.getUsername());

        // Check if username or email already exists
        if (internalUserRepository.existsByUsername(request.getUsername()) ||
                externalUserRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (internalUserRepository.existsByEmail(request.getEmail()) ||
                externalUserRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Create external user
        ExternalUser user = new ExternalUser();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(UserRole.CLIENT);
        user.setCompanyName(request.getCompanyName());
        user.setCompanyAddress(request.getCompanyAddress());
        user.setStatus(UserStatus.ACTIVE);
        user.setBusinessType(request.getBusinessType());
        user.setIndustry(request.getIndustry());
        user.setWebsiteUrl(request.getWebsiteUrl());
        user.setTaxId(request.getTaxId());
        user.setBillingAddress(request.getBillingAddress());

        ExternalUser savedUser = externalUserRepository.save(user);
        log.info("External user created successfully with ID: {}", savedUser.getId());

        return mapToUserResponse(savedUser);
    }

    /**
     * Authenticate user login
     */
    public LoginResponse authenticateUser(UserLoginRequest request) {
        log.info("Authenticating user: {}", request.getUsername());

        // Try to find in internal users first
        Optional<InternalUser> internalUser = internalUserRepository.findByUsername(request.getUsername());
        if (internalUser.isPresent()) {
            InternalUser user = internalUser.get();
            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                if (user.getStatus() != UserStatus.ACTIVE) {
                    return LoginResponse.failure("Account is not active");
                }

                // Update last login
                user.setLastLogin(LocalDateTime.now());
                internalUserRepository.save(user);

                log.info("Internal user authenticated successfully: {}", request.getUsername());
                return LoginResponse.success(mapToUserResponse(user));
            }
        }

        // Try to find in external users
        Optional<ExternalUser> externalUser = externalUserRepository.findByUsername(request.getUsername());
        if (externalUser.isPresent()) {
            ExternalUser user = externalUser.get();
            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                if (user.getStatus() != UserStatus.ACTIVE) {
                    return LoginResponse.failure("Account is not active");
                }

                // Update last login
                user.setLastLogin(LocalDateTime.now());
                externalUserRepository.save(user);

                log.info("External user authenticated successfully: {}", request.getUsername());
                return LoginResponse.success(mapToUserResponse(user));
            }
        }

        log.warn("Authentication failed for user: {}", request.getUsername());
        return LoginResponse.failure("Invalid username or password");
    }

    /**
     * Get user details by username (for authenticated endpoint)
     */
    public Optional<UserResponse> getUserByUsername(String username) {
        log.info("Getting user details for username: {}", username);

        // Try to find in internal users first
        Optional<InternalUser> internalUser = internalUserRepository.findByUsername(username);
        if (internalUser.isPresent()) {
            return Optional.of(mapToUserResponse(internalUser.get()));
        }

        // Try to find in external users
        Optional<ExternalUser> externalUser = externalUserRepository.findByUsername(username);
        if (externalUser.isPresent()) {
            return Optional.of(mapToUserResponse(externalUser.get()));
        }

        return Optional.empty();
    }

    /**
     * Validate user credentials for basic authentication
     */
    public boolean validateCredentials(String username, String password) {
        // Try internal users first
        Optional<InternalUser> internalUser = internalUserRepository.findByUsername(username);
        if (internalUser.isPresent()) {
            return passwordEncoder.matches(password, internalUser.get().getPassword()) &&
                    internalUser.get().getStatus() == UserStatus.ACTIVE;
        }

        // Try external users
        Optional<ExternalUser> externalUser = externalUserRepository.findByUsername(username);
        if (externalUser.isPresent()) {
            return passwordEncoder.matches(password, externalUser.get().getPassword()) &&
                    externalUser.get().getStatus() == UserStatus.ACTIVE;
        }

        return false;
    }

    /**
     * Map User entity to UserResponse DTO
     */
    private UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setRole(user.getRole());
        response.setStatus(user.getStatus());
        response.setProfileImageUrl(user.getProfileImageUrl());
        response.setCompanyName(user.getCompanyName());
        response.setCompanyAddress(user.getCompanyAddress());
        response.setLastLogin(user.getLastLogin());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        response.setInternalUser(user.isInternalUser());
        response.setClient(user.isClient());

        // Set specific fields based on user type
        if (user instanceof InternalUser) {
            InternalUser internalUser = (InternalUser) user;
            response.setEmployeeId(internalUser.getEmployeeId());
            response.setDepartment(internalUser.getDepartment());
            response.setOfficeLocation(internalUser.getOfficeLocation());
            response.setAccessLevel(internalUser.getAccessLevel());
        } else if (user instanceof ExternalUser) {
            ExternalUser externalUser = (ExternalUser) user;
            response.setBusinessType(externalUser.getBusinessType());
            response.setIndustry(externalUser.getIndustry());
            response.setWebsiteUrl(externalUser.getWebsiteUrl());
            response.setTaxId(externalUser.getTaxId());
            response.setBillingAddress(externalUser.getBillingAddress());
        }

        return response;
    }
}