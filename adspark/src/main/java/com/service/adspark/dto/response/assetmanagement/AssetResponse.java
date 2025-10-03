package com.service.adspark.dto.response.assetmanagement;

import com.service.adspark.model.enums.AssetType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AssetResponse {

    private Long id;
    private String name;
    private String description;
    private AssetType type;
    private String fileUrl;
    private String thumbnailUrl;
    private Long fileSize;
    private String fileType;
    private Integer width;
    private Integer height;
    private Integer durationSeconds;
    private String tags;
    private Boolean isPublic;
    private Long downloadCount;
    private Long usageCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // User information
    private Long userId;
    private String userName;
    private String userFullName;

    // Helper fields
    private String fileSizeFormatted;
    private String fileExtension;
}