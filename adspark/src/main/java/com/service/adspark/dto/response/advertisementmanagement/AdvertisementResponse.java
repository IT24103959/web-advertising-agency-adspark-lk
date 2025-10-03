package com.service.adspark.dto.response.advertisementmanagement;

import com.service.adspark.model.enums.AdFormat;
import com.service.adspark.model.enums.AdStatus;
import com.service.adspark.dto.response.assetmanagement.AssetResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdvertisementResponse {

    private Long id;
    private String title;
    private String description;
    private String clientName;
    private String clientEmail;
    private String clientPhone;
    private BigDecimal budget;
    private AdStatus status;
    private AdFormat format;
    private String targetAudience;
    private String campaignObjectives;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer durationDays;
    private String tags;
    private String notes;
    private Integer priorityLevel;
    private String priorityLevelDisplay;
    private Integer estimatedHours;
    private Integer actualHours;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // User information
    private String createdByUsername;
    private String createdByEmail;
    private String assignedToUsername;
    private String assignedToEmail;

    // Associated assets
    private List<AssetResponse> assets;

    // Additional computed fields
    private boolean canBeEdited;
    private boolean isActive;
    private boolean isCompleted;
}