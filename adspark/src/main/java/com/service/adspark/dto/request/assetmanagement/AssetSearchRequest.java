package com.service.adspark.dto.request.assetmanagement;

import com.service.adspark.model.enums.AssetType;
import lombok.Data;

@Data
public class AssetSearchRequest {

    private String name;
    private String description;
    private AssetType type;
    private String tags;
    private Boolean isPublic;
    private String fileType;
    private Long userId; // To search assets by user

    // Pagination
    private Integer page = 0;
    private Integer size = 20;

    // Sorting
    private String sortBy = "createdAt"; // name, createdAt, downloadCount, usageCount
    private String sortDirection = "desc"; // asc, desc

    // Size filters
    private Long minFileSize;
    private Long maxFileSize;

    // Dimension filters (for images/videos)
    private Integer minWidth;
    private Integer maxWidth;
    private Integer minHeight;
    private Integer maxHeight;
}