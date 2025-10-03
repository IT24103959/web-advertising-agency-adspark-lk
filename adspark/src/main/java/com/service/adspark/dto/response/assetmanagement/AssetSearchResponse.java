package com.service.adspark.dto.response.assetmanagement;

import lombok.Data;
import java.util.List;

@Data
public class AssetSearchResponse {

    private List<AssetResponse> assets;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;
    private boolean hasNext;
    private boolean hasPrevious;

    public AssetSearchResponse(List<AssetResponse> assets, long totalElements, int currentPage, int pageSize) {
        this.assets = assets;
        this.totalElements = totalElements;
        this.currentPage = currentPage;
        this.pageSize = pageSize;
        this.totalPages = (int) Math.ceil((double) totalElements / pageSize);
        this.hasNext = currentPage < totalPages - 1;
        this.hasPrevious = currentPage > 0;
    }
}