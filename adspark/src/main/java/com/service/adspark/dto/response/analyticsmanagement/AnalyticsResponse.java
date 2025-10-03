package com.service.adspark.dto.response.analyticsmanagement;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {

    private Long advertisementId;
    private String advertisementTitle;
    private Long totalClicks;
    private Long totalViews;
    private Long totalImpressions;
    private Double clickThroughRate; // CTR = clicks/impressions
    private Double viewRate; // Views/impressions
    private Double conversionRate; // Clicks/views

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime periodStart;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime periodEnd;

    // Additional metrics
    private Long uniqueUsers;
    private String topCountry;
    private String topDeviceType;
    private String topBrowserType;
    private Double avgSessionDuration;
}