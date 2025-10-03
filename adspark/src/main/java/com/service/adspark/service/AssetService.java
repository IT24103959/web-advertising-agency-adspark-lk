package com.service.adspark.service;

import com.service.adspark.dto.response.assetmanagement.*;
import com.service.adspark.dto.request.assetmanagement.*;
import com.service.adspark.dto.response.usermanagement.UserResponse;
import com.service.adspark.model.entity.Asset;
import com.service.adspark.model.entity.User;
import com.service.adspark.model.enums.AssetType;
import com.service.adspark.repository.AssetRepository;
import com.service.adspark.util.FileStorageUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AssetService {

    private final AssetRepository assetRepository;
    private final FileStorageUtil fileStorageUtil;
    private final UserService userService;

    /**
     * Create a new asset with file upload
     */
    public AssetResponse createAsset(AssetCreateRequest request, MultipartFile file, String username) {
        log.info("Creating asset: {} for user: {}", request.getName(), username);

        // Get user details
        UserResponse userResponse = userService.getUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        try {
            // Determine asset type from file if not provided
            AssetType assetType = determineAssetType(request.getType(), file);

            // Save file to local storage
            String subDirectory = "assets/" + assetType.name().toLowerCase();
            String relativePath = fileStorageUtil.saveFile(file, subDirectory);

            // Get file dimensions for images
            FileStorageUtil.ImageDimensions dimensions = new FileStorageUtil.ImageDimensions(0, 0);
            if (fileStorageUtil.isImageFile(file.getOriginalFilename())) {
                dimensions = fileStorageUtil.getImageDimensions(file);
            }

            // Create asset entity
            Asset asset = new Asset();
            asset.setName(request.getName());
            asset.setDescription(request.getDescription());
            asset.setType(assetType);
            asset.setFileUrl(relativePath);
            asset.setThumbnailUrl(relativePath); // For now, use same URL
            asset.setFileSize(file.getSize());
            asset.setFileType(fileStorageUtil.getContentType(file.getOriginalFilename()));
            asset.setWidth(request.getWidth() != null ? request.getWidth() : dimensions.width);
            asset.setHeight(request.getHeight() != null ? request.getHeight() : dimensions.height);
            asset.setDurationSeconds(request.getDurationSeconds());
            asset.setTags(request.getTags());
            asset.setIsPublic(request.getIsPublic() != null ? request.getIsPublic() : false);

            // Set user (we need to create a User entity from UserResponse)
            User user = new User() {
                {
                    setId(userResponse.getId());
                    setUsername(userResponse.getUsername());
                    setEmail(userResponse.getEmail());
                    setFirstName(userResponse.getFirstName());
                    setLastName(userResponse.getLastName());
                    setRole(userResponse.getRole());
                    setStatus(userResponse.getStatus());
                }
            };
            asset.setUser(user);

            Asset savedAsset = assetRepository.save(asset);
            log.info("Asset created successfully with ID: {}", savedAsset.getId());

            return mapToAssetResponse(savedAsset);

        } catch (IOException e) {
            log.error("Error saving file for asset: {}", request.getName(), e);
            throw new RuntimeException("Failed to save file: " + e.getMessage());
        }
    }

    /**
     * Search assets with filters and pagination
     */
    public AssetSearchResponse searchAssets(AssetSearchRequest request) {
        log.info("Searching assets with filters: {}", request);

        // Create pageable with sorting
        Sort sort = createSort(request.getSortBy(), request.getSortDirection());
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        // Perform search
        Page<Asset> assetPage = assetRepository.searchAssets(
                request.getName(),
                request.getDescription(),
                request.getType(),
                request.getTags(),
                request.getIsPublic(),
                request.getFileType(),
                request.getUserId(),
                request.getMinFileSize(),
                request.getMaxFileSize(),
                request.getMinWidth(),
                request.getMaxWidth(),
                request.getMinHeight(),
                request.getMaxHeight(),
                pageable);

        // Convert to response DTOs
        List<AssetResponse> assetResponses = assetPage.getContent().stream()
                .map(this::mapToAssetResponse)
                .collect(Collectors.toList());

        return new AssetSearchResponse(
                assetResponses,
                assetPage.getTotalElements(),
                assetPage.getNumber(),
                assetPage.getSize());
    }

    /**
     * Delete asset by ID
     */
    public boolean deleteAsset(Long assetId, String username) {
        log.info("Deleting asset with ID: {} by user: {}", assetId, username);

        // Get user details
        UserResponse userResponse = userService.getUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // Find asset
        Optional<Asset> assetOpt = assetRepository.findByIdAndUserId(assetId, userResponse.getId());
        if (assetOpt.isEmpty()) {
            throw new RuntimeException("Asset not found or access denied");
        }

        Asset asset = assetOpt.get();

        // Delete file from storage
        boolean fileDeleted = fileStorageUtil.deleteFile(asset.getFileUrl());
        if (!fileDeleted) {
            log.warn("Failed to delete file: {}", asset.getFileUrl());
        }

        // Delete thumbnail if different from main file
        if (asset.getThumbnailUrl() != null && !asset.getThumbnailUrl().equals(asset.getFileUrl())) {
            fileStorageUtil.deleteFile(asset.getThumbnailUrl());
        }

        // Delete from database
        assetRepository.delete(asset);
        log.info("Asset deleted successfully: {}", assetId);

        return true;
    }

    /**
     * Get asset by ID
     */
    public Optional<AssetResponse> getAssetById(Long assetId) {
        return assetRepository.findById(assetId)
                .map(this::mapToAssetResponse);
    }

    private AssetType determineAssetType(AssetType requestType, MultipartFile file) {
        if (requestType != null) {
            return requestType;
        }

        String filename = file.getOriginalFilename();
        if (fileStorageUtil.isImageFile(filename)) {
            return AssetType.IMAGE;
        } else if (fileStorageUtil.isVideoFile(filename)) {
            return AssetType.VIDEO;
        } else if (fileStorageUtil.isAudioFile(filename)) {
            return AssetType.AUDIO;
        } else {
            return AssetType.DOCUMENT;
        }
    }

    private Sort createSort(String sortBy, String sortDirection) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        return switch (sortBy.toLowerCase()) {
            case "name" -> Sort.by(direction, "name");
            case "createdat" -> Sort.by(direction, "createdAt");
            case "downloadcount" -> Sort.by(direction, "downloadCount");
            case "usagecount" -> Sort.by(direction, "usageCount");
            case "filesize" -> Sort.by(direction, "fileSize");
            default -> Sort.by(direction, "createdAt");
        };
    }

    private AssetResponse mapToAssetResponse(Asset asset) {
        AssetResponse response = new AssetResponse();
        response.setId(asset.getId());
        response.setName(asset.getName());
        response.setDescription(asset.getDescription());
        response.setType(asset.getType());
        response.setFileUrl(fileStorageUtil.getPublicUrl(asset.getFileUrl()));
        response.setThumbnailUrl(
                asset.getThumbnailUrl() != null ? fileStorageUtil.getPublicUrl(asset.getThumbnailUrl()) : null);
        response.setFileSize(asset.getFileSize());
        response.setFileType(asset.getFileType());
        response.setWidth(asset.getWidth());
        response.setHeight(asset.getHeight());
        response.setDurationSeconds(asset.getDurationSeconds());
        response.setTags(asset.getTags());
        response.setIsPublic(asset.getIsPublic());
        response.setDownloadCount(asset.getDownloadCount());
        response.setUsageCount(asset.getUsageCount());
        response.setCreatedAt(asset.getCreatedAt());
        response.setUpdatedAt(asset.getUpdatedAt());

        // User information
        if (asset.getUser() != null) {
            response.setUserId(asset.getUser().getId());
            response.setUserName(asset.getUser().getUsername());
            response.setUserFullName(asset.getUser().getFullName());
        }

        // Helper fields
        response.setFileSizeFormatted(fileStorageUtil.formatFileSize(asset.getFileSize()));
        response.setFileExtension(asset.getFileExtension());

        return response;
    }
}