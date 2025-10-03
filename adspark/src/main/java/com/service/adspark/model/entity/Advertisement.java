package com.service.adspark.model.entity;

import com.service.adspark.model.enums.AdFormat;
import com.service.adspark.model.enums.AdStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "advertisements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Advertisement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank(message = "Client name is required")
    @Column(name = "client_name", nullable = false)
    private String clientName;

    @Column(name = "client_email")
    private String clientEmail;

    @Column(name = "client_phone")
    private String clientPhone;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Ad format is required")
    @Column(name = "ad_format", nullable = false)
    private AdFormat format;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdStatus status = AdStatus.DRAFT;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "file_type")
    private String fileType;

    @Positive(message = "Duration must be positive")
    @Column(name = "duration_seconds")
    private Integer durationSeconds; // For video/audio ads

    @Column(name = "target_audience", columnDefinition = "TEXT")
    private String targetAudience;

    @Column(name = "campaign_objectives", columnDefinition = "TEXT")
    private String campaignObjectives;

    @Column(name = "campaign_name")
    private String campaignName;

    @Positive(message = "Budget must be positive")
    @Column(precision = 10, scale = 2)
    private BigDecimal budget;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(columnDefinition = "TEXT")
    private String tags;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "priority_level")
    private Integer priorityLevel = 3; // 1=High, 2=Medium, 3=Low, 4=Urgent, 5=Critical

    @Column(name = "estimated_hours")
    private Integer estimatedHours;

    @Column(name = "actual_hours")
    private Integer actualHours;

    @Column(columnDefinition = "TEXT")
    private String keywords;

    @Column(name = "click_url")
    private String clickUrl;

    @Column(name = "is_published")
    private Boolean isPublished = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_user_id")
    private User assignedTo;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "advertisement_assets", joinColumns = @JoinColumn(name = "advertisement_id"), inverseJoinColumns = @JoinColumn(name = "asset_id"))
    private List<Asset> assets;

    @OneToMany(mappedBy = "advertisement", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AdPerformance> performances;

    @OneToMany(mappedBy = "advertisement", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Payment> payments;

    // Helper methods
    public boolean isActive() {
        return status == AdStatus.ACTIVE && isPublished;
    }

    public boolean isScheduled() {
        return startDate != null && startDate.isAfter(LocalDate.now());
    }

    public boolean isExpired() {
        return endDate != null && endDate.isBefore(LocalDate.now());
    }

    public boolean isCompleted() {
        return status == AdStatus.COMPLETED || status == AdStatus.ARCHIVED;
    }

    public boolean canBeEdited() {
        return status == AdStatus.DRAFT || status == AdStatus.PENDING_APPROVAL || status == AdStatus.REJECTED;
    }

    public void updateStatus(AdStatus newStatus) {
        this.status = newStatus;
    }

    public BigDecimal getBudgetOrDefault() {
        return budget != null ? budget : BigDecimal.ZERO;
    }

    public String getPriorityLevelDisplay() {
        int level = priorityLevel != null ? priorityLevel : 3;
        return switch (level) {
            case 1 -> "High";
            case 2 -> "Medium";
            case 3 -> "Low";
            case 4 -> "Urgent";
            case 5 -> "Critical";
            default -> "Unknown";
        };
    }
}