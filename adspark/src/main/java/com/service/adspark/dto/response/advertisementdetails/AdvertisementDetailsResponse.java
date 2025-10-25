package com.service.adspark.dto.response.advertisementdetails;

import com.service.adspark.model.enums.AdFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdvertisementDetailsResponse {

    private Long id;
    private String title;
    private String description;
    private String clientName;
    private String clientEmail;
    private String clientPhone;
    private AdFormat format;
    private Integer durationSeconds;
    private String targetAudience;
    private String campaignObjectives;
    private String campaignName;
    private BigDecimal budget;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer durationDays;
    private String tags;
    private String notes;
    private Integer priorityLevel;
    private String priorityLevelDisplay;
    private Integer estimatedHours;
    private String keywords;
    private String clickUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long clientId;
    private String clientUsername;
}