package com.service.adspark.dto.request.advertisementdetails;

import com.service.adspark.model.enums.AdFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdvertisementDetailsCreateRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Client name is required")
    private String clientName;

    private String clientEmail;

    private String clientPhone;

    @NotNull(message = "Ad format is required")
    private AdFormat format;

    @Positive(message = "Duration must be positive")
    private Integer durationSeconds;

    private String targetAudience;

    private String campaignObjectives;

    private String campaignName;

    @Positive(message = "Budget must be positive")
    private BigDecimal budget;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer durationDays;

    private String tags;

    private String notes;

    private Integer priorityLevel;

    private Integer estimatedHours;

    private String keywords;

    private String clickUrl;
}