package com.service.adspark.model.entity;

import com.service.adspark.model.enums.EventType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "analytics_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private EventType eventType;

    @Column(name = "advertisement_id", nullable = false)
    private Long advertisementId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "session_id")
    private String sessionId;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "referrer_url", columnDefinition = "TEXT")
    private String referrerUrl;

    @Column(name = "page_url", columnDefinition = "TEXT")
    private String pageUrl;

    @Column(name = "device_type")
    private String deviceType;

    @Column(name = "browser_type")
    private String browserType;

    @Column(name = "location_country")
    private String locationCountry;

    @Column(name = "location_city")
    private String locationCity;

    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "advertisement_id", insertable = false, updatable = false)
    private Advertisement advertisement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    // Helper methods
    public boolean isClick() {
        return eventType == EventType.CLICK;
    }

    public boolean isView() {
        return eventType == EventType.VIEW;
    }

    public boolean isImpression() {
        return eventType == EventType.IMPRESSION;
    }
}