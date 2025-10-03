package com.service.adspark.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ad_performance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdPerformance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long views = 0L;

    @Column(nullable = false)
    private Long clicks = 0L;

    @Column(nullable = false)
    private Long impressions = 0L;

    @Column(name = "engagement_rate")
    private Double engagementRate = 0.0;

    @Column(name = "click_through_rate")
    private Double clickThroughRate = 0.0;

    @Column(name = "conversion_rate")
    private Double conversionRate = 0.0;

    @Column(name = "date_recorded")
    private LocalDateTime dateRecorded;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "advertisement_id", nullable = false)
    private Advertisement advertisement;

    // Helper methods
    public void calculateRates() {
        if (impressions > 0) {
            this.clickThroughRate = ((double) clicks / impressions) * 100;
            this.engagementRate = ((double) (clicks + views) / impressions) * 100;
        }
    }
}