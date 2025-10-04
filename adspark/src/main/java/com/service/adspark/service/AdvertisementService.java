package com.service.adspark.service;

import com.service.adspark.dto.response.advertisementmanagement.AdvertisementResponse;
import com.service.adspark.dto.response.advertisementmanagement.AdvertisementSummaryResponse;
import com.service.adspark.dto.response.assetmanagement.AssetResponse;
import com.service.adspark.dto.request.advertisementmanagement.CreateAdvertisementRequest;
import com.service.adspark.model.entity.Payment;
import com.service.adspark.model.entity.Advertisement;
import com.service.adspark.model.entity.Asset;
import com.service.adspark.model.entity.User;
import com.service.adspark.model.enums.AdStatus;
import com.service.adspark.model.enums.UserRole;
import com.service.adspark.model.enums.EventType;
import com.service.adspark.model.enums.PaymentStatus;

import com.service.adspark.repository.AdvertisementRepository;
import com.service.adspark.repository.AssetRepository;
import com.service.adspark.repository.AnalyticsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdvertisementService {

    private final AdvertisementRepository advertRepository;
    private final AssetRepository assetRepository;
    private final AnalyticsRepository analyticsRepository;
    private final UserService userService;

    /**
     * Create a new advert
     */
    public AdvertisementResponse createAdvert(CreateAdvertisementRequest request, String createdByUsername) {
        log.info("Creating advert with title: {} for client: {}", request.getTitle(), request.getClientName());

        // Get the user who is creating the advert
        User createdByUser = getUserByUsername(createdByUsername);

        // Validate that only internal users can create adverts
        if (!isInternalUser(createdByUser)) {
            throw new RuntimeException("Only internal users can create adverts");
        }

        // Create advert entity
        Advertisement advert = new Advertisement();
        advert.setTitle(request.getTitle());
        advert.setDescription(request.getDescription());
        advert.setClientName(request.getClientName());
        advert.setClientEmail(request.getClientEmail());
        advert.setClientPhone(request.getClientPhone());
        advert.setBudget(request.getBudget());
        advert.setFormat(request.getFormat());
        advert.setTargetAudience(request.getTargetAudience());
        advert.setCampaignObjectives(request.getCampaignObjectives());
        advert.setStartDate(request.getStartDate());
        advert.setEndDate(request.getEndDate());
        advert.setDurationDays(request.getDurationDays());
        advert.setTags(request.getTags());
        advert.setNotes(request.getNotes());
        advert.setPriorityLevel(request.getPriorityLevel());
        advert.setEstimatedHours(request.getEstimatedHours());
        advert.setStatus(AdStatus.DRAFT); // All new adverts start as DRAFT
        advert.setCreatedBy(createdByUser);

        // Set assigned user if provided
        if (request.getAssignedToUserId() != null) {
            User assignedUser = getUserById(request.getAssignedToUserId());
            if (!isInternalUser(assignedUser)) {
                throw new RuntimeException("Adverts can only be assigned to internal users");
            }
            advert.setAssignedTo(assignedUser);
        }

        // Associate assets if provided
        if (request.getAssetIds() != null && !request.getAssetIds().isEmpty()) {
            List<Asset> assets = new ArrayList<>();
            for (Long assetId : request.getAssetIds()) {
                Optional<Asset> assetOpt = assetRepository.findById(assetId);
                if (assetOpt.isPresent()) {
                    assets.add(assetOpt.get());
                } else {
                    log.warn("Asset with ID {} not found, skipping", assetId);
                }
            }
            advert.setAssets(assets);
        }

        Advertisement savedAdvert = advertRepository.save(advert);
        log.info("Advert created successfully with ID: {}", savedAdvert.getId());

        return mapToAdvertResponse(savedAdvert);
    }

    /**
     * Get advert by ID
     */
    @Transactional(readOnly = true)
    public AdvertisementResponse getAdvertById(Long id, String requestingUsername) {
        log.info("Fetching advert with ID: {}", id);

        User requestingUser = getUserByUsername(requestingUsername);

        Advertisement advert = advertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Advert not found with ID: " + id));

        // Check access permissions
        if (!canUserAccessAdvert(requestingUser, advert)) {
            throw new RuntimeException("Access denied: You don't have permission to view this advert");
        }

        return mapToAdvertResponse(advert);
    }

    /**
     * Delete advert by ID
     */
    public void deleteAdvert(Long id, String requestingUsername) {
        log.info("Deleting advert with ID: {}", id);

        User requestingUser = getUserByUsername(requestingUsername);

        Advertisement advert = advertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Advert not found with ID: " + id));

        // Check delete permissions
        if (!canUserDeleteAdvert(requestingUser, advert)) {
            throw new RuntimeException("Access denied: You don't have permission to delete this advert");
        }

        // Only allow deletion of adverts in certain states
        if (!advert.canBeEdited()) {
            throw new RuntimeException("Cannot delete advert in status: " + advert.getStatus());
        }

        advertRepository.delete(advert);
        log.info("Advert deleted successfully with ID: {}", id);
    }

    /**
     * Check if user can access an advert
     */
    private boolean canUserAccessAdvert(User user, Advertisement advert) {
        // Internal users can access all adverts
        if (isInternalUser(user)) {
            return true;
        }

        // External users (clients) can only access their own adverts
        if (user.getRole() == UserRole.CLIENT) {
            // Check if the client's email matches the advert's client email
            return user.getEmail().equals(advert.getClientEmail());
        }

        return false;
    }

    /**
     * Check if user can delete an advert
     */
    private boolean canUserDeleteAdvert(User user, Advertisement advert) {
        // Only internal users can delete adverts
        if (!isInternalUser(user)) {
            return false;
        }

        // Admins and Managers can delete any advert
        if (user.getRole() == UserRole.SYSTEM_ADMIN || user.getRole() == UserRole.MARKETING_MANAGER) {
            return true;
        }

        // Other internal users can only delete adverts they created
        return advert.getCreatedBy().getId().equals(user.getId());
    }

    /**
     * Check if user is internal user
     */
    private boolean isInternalUser(User user) {
        return user.getRole() == UserRole.SYSTEM_ADMIN ||
                user.getRole() == UserRole.FINANCE_TEAM ||
                user.getRole() == UserRole.MARKETING_MANAGER ||
                user.getRole() == UserRole.GRAPHIC_DESIGNER ||
                user.getRole() == UserRole.CUSTOMER_SUPPORT ||
                user.getRole() == UserRole.IT_SUPPORT;
    }

    /**
     * Get user by username
     */
    private User getUserByUsername(String username) {
        return userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    /**
     * Get user by ID
     */
    private User getUserById(Long userId) {
        return userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
    }

    /**
     * Map Advert entity to AdvertResponse DTO
     */
    private AdvertisementResponse mapToAdvertResponse(Advertisement advert) {
        AdvertisementResponse response = new AdvertisementResponse();
        response.setId(advert.getId());
        response.setTitle(advert.getTitle());
        response.setDescription(advert.getDescription());
        response.setClientName(advert.getClientName());
        response.setClientEmail(advert.getClientEmail());
        response.setClientPhone(advert.getClientPhone());
        response.setBudget(advert.getBudget());
        response.setStatus(advert.getStatus());
        response.setFormat(advert.getFormat());
        response.setTargetAudience(advert.getTargetAudience());
        response.setCampaignObjectives(advert.getCampaignObjectives());
        response.setStartDate(advert.getStartDate());
        response.setEndDate(advert.getEndDate());
        response.setDurationDays(advert.getDurationDays());
        response.setTags(advert.getTags());
        response.setNotes(advert.getNotes());
        response.setPriorityLevel(advert.getPriorityLevel());
        response.setPriorityLevelDisplay(advert.getPriorityLevelDisplay());
        response.setEstimatedHours(advert.getEstimatedHours());
        response.setActualHours(advert.getActualHours());
        response.setCreatedAt(advert.getCreatedAt());
        response.setUpdatedAt(advert.getUpdatedAt());

        // Set creator information
        if (advert.getCreatedBy() != null) {
            response.setCreatedByUsername(advert.getCreatedBy().getUsername());
            response.setCreatedByEmail(advert.getCreatedBy().getEmail());
        }

        // Set assigned user information
        if (advert.getAssignedTo() != null) {
            response.setAssignedToUsername(advert.getAssignedTo().getUsername());
            response.setAssignedToEmail(advert.getAssignedTo().getEmail());
        }

        // Set associated assets
        if (advert.getAssets() != null && !advert.getAssets().isEmpty()) {
            List<AssetResponse> assetResponses = advert.getAssets().stream()
                    .map(this::mapToAssetResponse)
                    .collect(Collectors.toList());
            response.setAssets(assetResponses);
        } else {
            response.setAssets(new ArrayList<>());
        }

        // Set computed fields
        response.setCanBeEdited(advert.canBeEdited());
        response.setActive(advert.isActive());
        response.setCompleted(advert.isCompleted());

        return response;
    }

    /**
     * Map Asset entity to AssetResponse DTO (simplified)
     */
    private AssetResponse mapToAssetResponse(Asset asset) {
        AssetResponse response = new AssetResponse();
        response.setId(asset.getId());
        response.setName(asset.getName());
        response.setDescription(asset.getDescription());
        response.setType(asset.getType());
        response.setFileUrl(asset.getFileUrl());
        response.setThumbnailUrl(asset.getThumbnailUrl());
        response.setFileSize(asset.getFileSize());
        response.setFileType(asset.getFileType());
        response.setCreatedAt(asset.getCreatedAt());
        return response;
    }

    @Transactional(readOnly = true)
    public List<AdvertisementSummaryResponse> getUserAdvertisementSummaries(String username) {
        log.info("Getting advertisement summaries for user: {}", username);

        User user = getUserByUsername(username);
        List<Advertisement> advertisements;

        // Get advertisements based on user role
        if (user.getRole() == UserRole.CLIENT) {
            // External users see adverts where they are the client
            advertisements = advertRepository.findByClientEmailOrClientNameContainingIgnoreCase(user.getEmail(),
                    user.getFullName());
        } else {
            // Internal users see adverts they created or are assigned to
            advertisements = advertRepository.findByCreatedByOrAssignedTo(user, user);
        }

        log.info("Found {} advertisements for user: {}", advertisements.size(), username);

        return advertisements.stream()
                .map(this::mapToAdvertisementSummary)
                .collect(Collectors.toList());
    }

    /**
     * Map Advertisement entity to AdvertisementSummaryResponse DTO
     */
    private AdvertisementSummaryResponse mapToAdvertisementSummary(Advertisement ad) {
        AdvertisementSummaryResponse summary = new AdvertisementSummaryResponse();

        // Basic advertisement information
        summary.setId(ad.getId());
        summary.setTitle(ad.getTitle());
        summary.setDescription(ad.getDescription());
        summary.setClientName(ad.getClientName());
        summary.setFormat(ad.getFormat());
        summary.setStatus(ad.getStatus());
        summary.setCampaignName(ad.getCampaignName());
        summary.setBudget(ad.getBudgetOrDefault());
        summary.setStartDate(ad.getStartDate());
        summary.setEndDate(ad.getEndDate());
        summary.setDurationDays(ad.getDurationDays());
        summary.setPriorityLevelDisplay(ad.getPriorityLevelDisplay());
        summary.setIsPublished(ad.getIsPublished());
        summary.setCreatedAt(ad.getCreatedAt());
        summary.setUpdatedAt(ad.getUpdatedAt());

        // User information
        if (ad.getCreatedBy() != null) {
            summary.setCreatedByUsername(ad.getCreatedBy().getUsername());
        }
        if (ad.getAssignedTo() != null) {
            summary.setAssignedToUsername(ad.getAssignedTo().getUsername());
        }

        // Status indicators
        summary.setIsActive(ad.isActive());
        summary.setIsScheduled(ad.isScheduled());
        summary.setIsExpired(ad.isExpired());
        summary.setCanBeEdited(ad.canBeEdited());

        // File information
        summary.setFileUrl(ad.getFileUrl());
        summary.setThumbnailUrl(ad.getThumbnailUrl());

        // Asset count
        if (ad.getAssets() != null) {
            summary.setTotalAssets(ad.getAssets().size());
        }

        // Analytics metrics (with error handling)
        try {
            Long clicks = analyticsRepository.countByAdvertisementIdAndEventType(ad.getId(), EventType.CLICK);
            Long views = analyticsRepository.countByAdvertisementIdAndEventType(ad.getId(), EventType.VIEW);
            Long impressions = analyticsRepository.countByAdvertisementIdAndEventType(ad.getId(), EventType.IMPRESSION);

            summary.setTotalClicks(clicks);
            summary.setTotalViews(views);
            summary.setTotalImpressions(impressions);

            // Calculate rates
            if (impressions > 0) {
                summary.setClickThroughRate(
                        Math.round((clicks.doubleValue() / impressions.doubleValue()) * 10000.0) / 100.0);
                summary.setViewRate(Math.round((views.doubleValue() / impressions.doubleValue()) * 10000.0) / 100.0);
            }
        } catch (Exception e) {
            log.warn("Could not load analytics for advertisement {}: {}", ad.getId(), e.getMessage());
            // Keep default values (0)
        }

        // Payment information (with error handling)
        try {
            if (ad.getPayments() != null) {
                summary.setTotalPayments((long) ad.getPayments().size());

                BigDecimal totalPaid = ad.getPayments().stream()
                        .filter(payment -> payment.getStatus() == PaymentStatus.COMPLETED)
                        .map(Payment::getAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal totalPending = ad.getPayments().stream()
                        .filter(payment -> payment.getStatus() == PaymentStatus.PENDING)
                        .map(Payment::getAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                summary.setTotalPaidAmount(totalPaid);
                summary.setPendingAmount(totalPending);
            }
        } catch (Exception e) {
            log.warn("Could not load payment information for advertisement {}: {}", ad.getId(), e.getMessage());
            // Keep default values
        }

        return summary;
    }
}