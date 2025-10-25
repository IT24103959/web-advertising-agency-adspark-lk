package com.service.adspark.dto.response.advertisementmanagement;

import com.service.adspark.model.enums.AdFormat;
import com.service.adspark.model.enums.AdStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdvertisementSummaryResponse {

    private Long id;
    private String title;
    private String description;
    private String clientName;
    private AdFormat format;
    private AdStatus status;
    private String campaignName;
    private BigDecimal budget;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    private Integer durationDays;
    private String priorityLevelDisplay;
    private Boolean isPublished;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    // User information
    private String createdByUsername;
    private String assignedToUsername;
    private Long clientId;

    // Performance metrics (from analytics)
    private Long totalClicks = 0L;
    private Long totalViews = 0L;
    private Long totalImpressions = 0L;
    private Double clickThroughRate = 0.0;
    private Double viewRate = 0.0;

    // Status indicators
    private Boolean isActive;
    private Boolean isScheduled;
    private Boolean isExpired;
    private Boolean canBeEdited;

    // Financial information
    private Long totalPayments = 0L;
    private BigDecimal totalPaidAmount = BigDecimal.ZERO;
    private BigDecimal pendingAmount = BigDecimal.ZERO;

    // Asset information
    private Integer totalAssets = 0;
    private String fileUrl;
    private String thumbnailUrl;
}