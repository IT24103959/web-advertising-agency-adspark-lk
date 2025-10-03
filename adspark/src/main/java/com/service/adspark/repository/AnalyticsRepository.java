package com.service.adspark.repository;

import com.service.adspark.model.entity.AnalyticsEvent;
import com.service.adspark.model.enums.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnalyticsRepository extends JpaRepository<AnalyticsEvent, Long> {

    // Count events by type and advertisement
    @Query("SELECT COUNT(e) FROM AnalyticsEvent e WHERE e.advertisementId = :adId AND e.eventType = :eventType")
    Long countByAdvertisementIdAndEventType(@Param("adId") Long advertisementId,
                                            @Param("eventType") EventType eventType);

    // Count events by type, advertisement and date range
    @Query("SELECT COUNT(e) FROM AnalyticsEvent e WHERE e.advertisementId = :adId AND e.eventType = :eventType AND e.createdAt BETWEEN :startDate AND :endDate")
    Long countByAdvertisementIdAndEventTypeAndDateRange(@Param("adId") Long advertisementId,
                                                        @Param("eventType") EventType eventType,
                                                        @Param("startDate") LocalDateTime startDate,
                                                        @Param("endDate") LocalDateTime endDate);

    // Count unique users for advertisement
    @Query("SELECT COUNT(DISTINCT e.userId) FROM AnalyticsEvent e WHERE e.advertisementId = :adId AND e.userId IS NOT NULL")
    Long countUniqueUsersByAdvertisementId(@Param("adId") Long advertisementId);

    // Count unique users for advertisement and date range
    @Query("SELECT COUNT(DISTINCT e.userId) FROM AnalyticsEvent e WHERE e.advertisementId = :adId AND e.userId IS NOT NULL AND e.createdAt BETWEEN :startDate AND :endDate")
    Long countUniqueUsersByAdvertisementIdAndDateRange(@Param("adId") Long advertisementId,
                                                       @Param("startDate") LocalDateTime startDate,
                                                       @Param("endDate") LocalDateTime endDate);

    // Find events by advertisement and date range
    List<AnalyticsEvent> findByAdvertisementIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long advertisementId,
                                                                                      LocalDateTime startDate,
                                                                                      LocalDateTime endDate);

    // Find recent events for dashboard
    @Query("SELECT e FROM AnalyticsEvent e ORDER BY e.createdAt DESC")
    List<AnalyticsEvent> findRecentEvents(@Param("limit") int limit);

    // Get top country for advertisement
    @Query("SELECT e.locationCountry FROM AnalyticsEvent e WHERE e.advertisementId = :adId AND e.locationCountry IS NOT NULL GROUP BY e.locationCountry ORDER BY COUNT(e) DESC")
    List<String> findTopCountriesByAdvertisementId(@Param("adId") Long advertisementId);

    // Get top device type for advertisement
    @Query("SELECT e.deviceType FROM AnalyticsEvent e WHERE e.advertisementId = :adId AND e.deviceType IS NOT NULL GROUP BY e.deviceType ORDER BY COUNT(e) DESC")
    List<String> findTopDeviceTypesByAdvertisementId(@Param("adId") Long advertisementId);

    // Get top browser type for advertisement
    @Query("SELECT e.browserType FROM AnalyticsEvent e WHERE e.advertisementId = :adId AND e.browserType IS NOT NULL GROUP BY e.browserType ORDER BY COUNT(e) DESC")
    List<String> findTopBrowserTypesByAdvertisementId(@Param("adId") Long advertisementId);

    // Get events grouped by day for trends
    @Query("SELECT DATE(e.createdAt) as day, COUNT(e) as count FROM AnalyticsEvent e WHERE e.advertisementId = :adId AND e.eventType = :eventType AND e.createdAt BETWEEN :startDate AND :endDate GROUP BY DATE(e.createdAt) ORDER BY day")
    List<Object[]> findDailyEventCounts(@Param("adId") Long advertisementId,
                                        @Param("eventType") EventType eventType,
                                        @Param("startDate") LocalDateTime startDate,
                                        @Param("endDate") LocalDateTime endDate);

    // Get total events count by type
    @Query("SELECT e.eventType, COUNT(e) FROM AnalyticsEvent e GROUP BY e.eventType")
    List<Object[]> findTotalEventCountsByType();

    // Get top performing advertisements
    @Query("SELECT e.advertisementId, COUNT(e) as totalEvents FROM AnalyticsEvent e GROUP BY e.advertisementId ORDER BY totalEvents DESC")
    List<Object[]> findTopPerformingAdvertisements(@Param("limit") int limit);

    // Find events by user and date range
    List<AnalyticsEvent> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long userId,
                                                                             LocalDateTime startDate,
                                                                             LocalDateTime endDate);
}