package com.service.adspark.dto.response.analyticsmanagement;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardMetricsResponse {

    private Long totalAdvertisements;
    private Long totalClicks;
    private Long totalViews;
    private Long totalImpressions;
    private Double overallCTR;
    private Double overallViewRate;

    // Top performing advertisements
    private List<AnalyticsResponse> topPerformingAds;

    // Recent activity
    private List<EventSummary> recentEvents;

    // Performance trends
    private List<TrendData> clickTrends;
    private List<TrendData> viewTrends;
    private List<TrendData> impressionTrends;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventSummary {
        private String eventType;
        private Long advertisementId;
        private String advertisementTitle;
        private String timestamp;
        private String location;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendData {
        private String period;
        private Long value;
        private Double changePercent;
    }
}