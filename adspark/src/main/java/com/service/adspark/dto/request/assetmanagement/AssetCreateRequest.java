package com.service.adspark.dto.request.assetmanagement;

import com.service.adspark.model.enums.AssetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssetCreateRequest {

    @NotBlank(message = "Asset name is required")
    private String name;

    private String description;

    @NotNull(message = "Asset type is required")
    private AssetType type;

    private String tags;

    private Boolean isPublic = false;

    private Integer width;
    private Integer height;
    private Integer durationSeconds; // For video/audio assets
}