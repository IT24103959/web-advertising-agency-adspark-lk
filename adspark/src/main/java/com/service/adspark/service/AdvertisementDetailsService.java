package com.service.adspark.service;

import com.service.adspark.dto.request.advertisementdetails.AdvertisementDetailsCreateRequest;
import com.service.adspark.dto.response.advertisementdetails.AdvertisementDetailsResponse;
import com.service.adspark.model.entity.AdvertisementDetails;
import com.service.adspark.model.entity.User;
import com.service.adspark.repository.AdvertisementDetailsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdvertisementDetailsService {

    private final AdvertisementDetailsRepository advertisementDetailsRepository;
    private final UserService userService;

    @Transactional
    public AdvertisementDetailsResponse createAdvertisementDetails(AdvertisementDetailsCreateRequest request, String clientUsername) {
        log.info("Creating advertisement details for client: {}", clientUsername);

        // Get the client user
        Optional<User> clientOpt = userService.findByUsername(clientUsername);
        if (clientOpt.isEmpty()) {
            throw new RuntimeException("Client user not found: " + clientUsername);
        }

        User client = clientOpt.get();

        // Create advertisement details entity
        AdvertisementDetails advertisementDetails = new AdvertisementDetails();
        advertisementDetails.setTitle(request.getTitle());
        advertisementDetails.setDescription(request.getDescription());
        advertisementDetails.setClientName(request.getClientName());
        advertisementDetails.setClientEmail(request.getClientEmail());
        advertisementDetails.setClientPhone(request.getClientPhone());
        advertisementDetails.setFormat(request.getFormat());
        advertisementDetails.setDurationSeconds(request.getDurationSeconds());
        advertisementDetails.setTargetAudience(request.getTargetAudience());
        advertisementDetails.setCampaignObjectives(request.getCampaignObjectives());
        advertisementDetails.setCampaignName(request.getCampaignName());
        advertisementDetails.setBudget(request.getBudget());
        advertisementDetails.setStartDate(request.getStartDate());
        advertisementDetails.setEndDate(request.getEndDate());
        advertisementDetails.setDurationDays(request.getDurationDays());
        advertisementDetails.setTags(request.getTags());
        advertisementDetails.setNotes(request.getNotes());
        advertisementDetails.setPriorityLevel(request.getPriorityLevel() != null ? request.getPriorityLevel() : 3);
        advertisementDetails.setEstimatedHours(request.getEstimatedHours());
        advertisementDetails.setKeywords(request.getKeywords());
        advertisementDetails.setClickUrl(request.getClickUrl());
        advertisementDetails.setClient(client);

        // Save the advertisement details
        AdvertisementDetails savedDetails = advertisementDetailsRepository.save(advertisementDetails);

        log.info("Advertisement details created with ID: {}", savedDetails.getId());

        return convertToResponse(savedDetails);
    }

    @Transactional(readOnly = true)
    public List<AdvertisementDetailsResponse> getAllAdvertisementDetails() {
        log.info("Fetching all advertisement details");
        List<AdvertisementDetails> allDetails = advertisementDetailsRepository.findAll();
        return allDetails.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private AdvertisementDetailsResponse convertToResponse(AdvertisementDetails details) {
        AdvertisementDetailsResponse response = new AdvertisementDetailsResponse();
        response.setId(details.getId());
        response.setTitle(details.getTitle());
        response.setDescription(details.getDescription());
        response.setClientName(details.getClientName());
        response.setClientEmail(details.getClientEmail());
        response.setClientPhone(details.getClientPhone());
        response.setFormat(details.getFormat());
        response.setDurationSeconds(details.getDurationSeconds());
        response.setTargetAudience(details.getTargetAudience());
        response.setCampaignObjectives(details.getCampaignObjectives());
        response.setCampaignName(details.getCampaignName());
        response.setBudget(details.getBudget());
        response.setStartDate(details.getStartDate());
        response.setEndDate(details.getEndDate());
        response.setDurationDays(details.getDurationDays());
        response.setTags(details.getTags());
        response.setNotes(details.getNotes());
        response.setPriorityLevel(details.getPriorityLevel());
        response.setPriorityLevelDisplay(details.getPriorityLevelDisplay());
        response.setEstimatedHours(details.getEstimatedHours());
        response.setKeywords(details.getKeywords());
        response.setClickUrl(details.getClickUrl());
        response.setCreatedAt(details.getCreatedAt());
        response.setUpdatedAt(details.getUpdatedAt());

        // Set client information
        if (details.getClient() != null) {
            response.setClientId(details.getClient().getId());
            response.setClientUsername(details.getClient().getUsername());
        }

        return response;
    }
}