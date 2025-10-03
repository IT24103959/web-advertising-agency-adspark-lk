package com.service.adspark.service;

import com.service.adspark.dto.request.analyticsmanagement.TrackEventRequest;
import com.service.adspark.dto.request.analyticsmanagement.MetricsRequest;
import com.service.adspark.dto.response.analyticsmanagement.AnalyticsResponse;
import com.service.adspark.dto.response.analyticsmanagement.DashboardMetricsResponse;
import com.service.adspark.model.entity.AnalyticsEvent;
import com.service.adspark.model.entity.Advertisement;
import com.service.adspark.model.enums.EventType;
import com.service.adspark.model.enums.MetricType;
import com.service.adspark.repository.AnalyticsRepository;
import com.service.adspark.repository.AdvertisementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepository;
    private final AdvertisementRepository advertRepository;

    /**
     * Track an analytics event (clicks, views, impressions)
     */
    public void trackEvent(TrackEventRequest request) {
        log.info("Tracking {} event for advertisement ID: {}", request.getEventType(), request.getAdvertisementId());

        // Validate advertisement exists
        Advertisement advertisement = advertRepository.findById(request.getAdvertisementId())
                .orElseThrow(
                        () -> new RuntimeException("Advertisement not found with ID: " + request.getAdvertisementId()));

        // Create analytics event
        AnalyticsEvent event = new AnalyticsEvent();
        event.setEventType(request.getEventType());
        event.setAdvertisementId(request.getAdvertisementId());
        event.setUserId(request.getUserId());
        event.setSessionId(request.getSessionId());
        event.setIpAddress(request.getIpAddress());
        event.setUserAgent(request.getUserAgent());
        event.setReferrerUrl(request.getReferrerUrl());
        event.setPageUrl(request.getPageUrl());
        event.setDeviceType(request.getDeviceType());
        event.setBrowserType(request.getBrowserType());
        event.setLocationCountry(request.getLocationCountry());
        event.setLocationCity(request.getLocationCity());
        event.setMetadata(request.getMetadata());

        analyticsRepository.save(event);
        log.info("Successfully tracked {} event for advertisement: {}", request.getEventType(),
                advertisement.getTitle());
    }

    /**
     * Get analytics metrics for a specific advertisement
     */
    @Transactional(readOnly = true)
    public AnalyticsResponse getAdvertisementMetrics(Long advertisementId, MetricsRequest request) {
        log.info("Getting metrics for advertisement ID: {}", advertisementId);

        // Validate advertisement exists
        Advertisement advertisement = advertRepository.findById(advertisementId)
                .orElseThrow(() -> new RuntimeException("Advertisement not found with ID: " + advertisementId));

        // Determine date range
        LocalDateTime[] dateRange = getDateRange(request);
        LocalDateTime startDate = dateRange[0];
        LocalDateTime endDate = dateRange[1];

        // Get metrics
        Long totalClicks = analyticsRepository.countByAdvertisementIdAndEventTypeAndDateRange(
                advertisementId, EventType.CLICK, startDate, endDate);
        Long totalViews = analyticsRepository.countByAdvertisementIdAndEventTypeAndDateRange(
                advertisementId, EventType.VIEW, startDate, endDate);
        Long totalImpressions = analyticsRepository.countByAdvertisementIdAndEventTypeAndDateRange(
                advertisementId, EventType.IMPRESSION, startDate, endDate);
        Long uniqueUsers = analyticsRepository.countUniqueUsersByAdvertisementIdAndDateRange(
                advertisementId, startDate, endDate);

        // Calculate rates
        Double clickThroughRate = totalImpressions > 0
                ? (totalClicks.doubleValue() / totalImpressions.doubleValue()) * 100
                : 0.0;
        Double viewRate = totalImpressions > 0 ? (totalViews.doubleValue() / totalImpressions.doubleValue()) * 100
                : 0.0;
        Double conversionRate = totalViews > 0 ? (totalClicks.doubleValue() / totalViews.doubleValue()) * 100 : 0.0;

        // Get top demographics
        List<String> topCountries = analyticsRepository.findTopCountriesByAdvertisementId(advertisementId);
        List<String> topDeviceTypes = analyticsRepository.findTopDeviceTypesByAdvertisementId(advertisementId);
        List<String> topBrowserTypes = analyticsRepository.findTopBrowserTypesByAdvertisementId(advertisementId);

        // Build response
        AnalyticsResponse response = new AnalyticsResponse();
        response.setAdvertisementId(advertisementId);
        response.setAdvertisementTitle(advertisement.getTitle());
        response.setTotalClicks(totalClicks);
        response.setTotalViews(totalViews);
        response.setTotalImpressions(totalImpressions);
        response.setClickThroughRate(Math.round(clickThroughRate * 100.0) / 100.0);
        response.setViewRate(Math.round(viewRate * 100.0) / 100.0);
        response.setConversionRate(Math.round(conversionRate * 100.0) / 100.0);
        response.setPeriodStart(startDate);
        response.setPeriodEnd(endDate);
        response.setUniqueUsers(uniqueUsers);
        response.setTopCountry(topCountries.isEmpty() ? "N/A" : topCountries.get(0));
        response.setTopDeviceType(topDeviceTypes.isEmpty() ? "N/A" : topDeviceTypes.get(0));
        response.setTopBrowserType(topBrowserTypes.isEmpty() ? "N/A" : topBrowserTypes.get(0));

        log.info("Generated metrics for advertisement {}: {} clicks, {} views, {} impressions",
                advertisement.getTitle(), totalClicks, totalViews, totalImpressions);

        return response;
    }

    /**
     * Get dashboard metrics overview
     */
    @Transactional(readOnly = true)
    public DashboardMetricsResponse getDashboardMetrics() {
        log.info("Getting dashboard metrics overview");

        // Get total counts by event type
        List<Object[]> totalCounts = analyticsRepository.findTotalEventCountsByType();
        Long totalClicks = 0L, totalViews = 0L, totalImpressions = 0L;

        for (Object[] count : totalCounts) {
            EventType eventType = (EventType) count[0];
            Long eventCount = (Long) count[1];

            switch (eventType) {
                case CLICK -> totalClicks = eventCount;
                case VIEW -> totalViews = eventCount;
                case IMPRESSION -> totalImpressions = eventCount;
            }
        }

        // Calculate overall rates
        Double overallCTR = totalImpressions > 0 ? (totalClicks.doubleValue() / totalImpressions.doubleValue()) * 100
                : 0.0;
        Double overallViewRate = totalImpressions > 0
                ? (totalViews.doubleValue() / totalImpressions.doubleValue()) * 100
                : 0.0;

        // Get top performing advertisements
        List<Object[]> topAdsData = analyticsRepository.findTopPerformingAdvertisements(5);
        List<AnalyticsResponse> topPerformingAds = topAdsData.stream()
                .map(data -> {
                    Long adId = (Long) data[0];
                    try {
                        MetricsRequest request = new MetricsRequest();
                        request.setMetricType(MetricType.MONTHLY);
                        return getAdvertisementMetrics(adId, request);
                    } catch (Exception e) {
                        log.warn("Could not get metrics for advertisement {}: {}", adId, e.getMessage());
                        return null;
                    }
                })
                .filter(response -> response != null)
                .collect(Collectors.toList());

        // Get recent events
        List<AnalyticsEvent> recentEventsList = analyticsRepository.findRecentEvents(10);
        List<DashboardMetricsResponse.EventSummary> recentEvents = recentEventsList.stream()
                .map(event -> {
                    String adTitle = "Unknown";
                    try {
                        Advertisement ad = advertRepository.findById(event.getAdvertisementId()).orElse(null);
                        if (ad != null) {
                            adTitle = ad.getTitle();
                        }
                    } catch (Exception e) {
                        log.warn("Could not get advertisement title for event {}", event.getId());
                    }

                    return new DashboardMetricsResponse.EventSummary(
                            event.getEventType().getDisplayName(),
                            event.getAdvertisementId(),
                            adTitle,
                            event.getCreatedAt().toString(),
                            event.getLocationCountry() != null ? event.getLocationCountry() : "Unknown");
                })
                .collect(Collectors.toList());

        // Generate trend data (simplified for now)
        List<DashboardMetricsResponse.TrendData> clickTrends = generateTrendData(EventType.CLICK);
        List<DashboardMetricsResponse.TrendData> viewTrends = generateTrendData(EventType.VIEW);
        List<DashboardMetricsResponse.TrendData> impressionTrends = generateTrendData(EventType.IMPRESSION);

        // Count total advertisements
        Long totalAdvertisements = advertRepository.count();

        DashboardMetricsResponse response = new DashboardMetricsResponse();
        response.setTotalAdvertisements(totalAdvertisements);
        response.setTotalClicks(totalClicks);
        response.setTotalViews(totalViews);
        response.setTotalImpressions(totalImpressions);
        response.setOverallCTR(Math.round(overallCTR * 100.0) / 100.0);
        response.setOverallViewRate(Math.round(overallViewRate * 100.0) / 100.0);
        response.setTopPerformingAds(topPerformingAds);
        response.setRecentEvents(recentEvents);
        response.setClickTrends(clickTrends);
        response.setViewTrends(viewTrends);
        response.setImpressionTrends(impressionTrends);

        log.info("Generated dashboard metrics: {} total ads, {} clicks, {} views, {} impressions",
                totalAdvertisements, totalClicks, totalViews, totalImpressions);

        return response;
    }

    /**
     * Helper method to determine date range based on metric type
     */
    private LocalDateTime[] getDateRange(MetricsRequest request) {
        LocalDateTime endDate = request.getEndDate() != null ? request.getEndDate() : LocalDateTime.now();
        LocalDateTime startDate;

        if (request.getStartDate() != null) {
            startDate = request.getStartDate();
        } else {
            startDate = switch (request.getMetricType()) {
                case DAILY -> endDate.minus(1, ChronoUnit.DAYS);
                case WEEKLY -> endDate.minus(7, ChronoUnit.DAYS);
                case MONTHLY -> endDate.minus(30, ChronoUnit.DAYS);
                case YEARLY -> endDate.minus(365, ChronoUnit.DAYS);
                default -> endDate.minus(30, ChronoUnit.DAYS);
            };
        }

        return new LocalDateTime[] { startDate, endDate };
    }

    /**
     * Generate simplified trend data
     */
    private List<DashboardMetricsResponse.TrendData> generateTrendData(EventType eventType) {
        List<DashboardMetricsResponse.TrendData> trends = new ArrayList<>();

        // For now, just generate placeholder data
        // In a real implementation, you'd query the database for actual trend data
        for (int i = 6; i >= 0; i--) {
            LocalDateTime date = LocalDateTime.now().minus(i, ChronoUnit.DAYS);
            String period = date.toLocalDate().toString();
            Long value = (long) (Math.random() * 100); // Placeholder random value
            Double changePercent = (Math.random() - 0.5) * 20; // Random percentage change

            trends.add(new DashboardMetricsResponse.TrendData(period, value,
                    Math.round(changePercent * 100.0) / 100.0));
        }

        return trends;
    }
}