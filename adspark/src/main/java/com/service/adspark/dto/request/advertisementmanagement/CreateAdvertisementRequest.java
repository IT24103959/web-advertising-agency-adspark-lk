package com.service.adspark.dto.request.advertisementmanagement;

import com.service.adspark.model.enums.AdFormat;
import com.service.adspark.model.enums.AdStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAdvertisementRequest {

    @NotBlank(message = "Advert title is required")
    private String title;

    private String description;

    @NotBlank(message = "Client name is required")
    private String clientName;

    private String clientEmail;

    private String clientPhone;

    @DecimalMin(value = "0.0", inclusive = false, message = "Budget must be greater than 0")
    private BigDecimal budget;

    @NotNull(message = "Advert format is required")
    private AdFormat format;

    private String targetAudience;

    private String campaignObjectives;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer durationDays;

    private String tags;

    private String notes;

    private Integer priorityLevel = 3; // Default to Low priority

    private Integer estimatedHours;

    private Long assignedToUserId; // ID of user to assign this advert to

    private List<Long> assetIds; // Asset IDs to associate with this advert
}