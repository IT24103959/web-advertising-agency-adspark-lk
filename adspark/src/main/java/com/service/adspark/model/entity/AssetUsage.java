package com.service.adspark.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "asset_usage")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssetUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usage_context")
    private String usageContext; // e.g., "Advertisement", "Campaign", etc.

    @Column(name = "context_id")
    private Long contextId; // ID of the advertisement, campaign, etc.

    @CreationTimestamp
    @Column(name = "used_at", nullable = false, updatable = false)
    private LocalDateTime usedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}