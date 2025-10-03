package com.service.adspark.dto.response.usermanagement;

import com.service.adspark.model.enums.UserRole;
import com.service.adspark.model.enums.UserStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private UserRole role;
    private UserStatus status;
    private String profileImageUrl;
    private String companyName;
    private String companyAddress;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Additional fields for internal users
    private String employeeId;
    private String department;
    private String officeLocation;
    private Integer accessLevel;

    // Additional fields for external users
    private String businessType;
    private String industry;
    private String websiteUrl;
    private String taxId;
    private String billingAddress;

    private boolean isInternalUser;
    private boolean isClient;
}