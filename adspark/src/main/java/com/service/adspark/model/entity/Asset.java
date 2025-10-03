package com.service.adspark.model.entity;

import com.service.adspark.model.enums.AssetType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "assets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Asset name is required")
    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Asset type is required")
    @Column(name = "asset_type", nullable = false)
    private AssetType type;

    @NotBlank(message = "File URL is required")
    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "width")
    private Integer width;

    @Column(name = "height")
    private Integer height;

    @Column(name = "duration_seconds")
    private Integer durationSeconds; // For video/audio assets

    @Column(columnDefinition = "TEXT")
    private String tags;

    @Column(name = "is_public")
    private Boolean isPublic = false;

    @Column(name = "download_count")
    private Long downloadCount = 0L;

    @Column(name = "usage_count")
    private Long usageCount = 0L;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "asset", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AssetUsage> assetUsages;

    // Helper methods
    public void incrementDownloadCount() {
        this.downloadCount++;
    }

    public void incrementUsageCount() {
        this.usageCount++;
    }

    public String getFileExtension() {
        if (fileUrl != null && fileUrl.contains(".")) {
            return fileUrl.substring(fileUrl.lastIndexOf(".") + 1).toLowerCase();
        }
        return "";
    }
}