package com.service.adspark.dto.request.analyticsmanagement;

import com.service.adspark.model.enums.EventType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrackEventRequest {

    @NotNull(message = "Event type is required")
    private EventType eventType;

    @NotNull(message = "Advertisement ID is required")
    private Long advertisementId;

    private Long userId;
    private String sessionId;
    private String ipAddress;
    private String userAgent;
    private String referrerUrl;
    private String pageUrl;
    private String deviceType;
    private String browserType;
    private String locationCountry;
    private String locationCity;
    private String metadata;
}