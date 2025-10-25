package com.service.adspark.repository;

import com.service.adspark.model.entity.AdvertisementDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdvertisementDetailsRepository extends JpaRepository<AdvertisementDetails, Long> {

    /**
     * Find all advertisement details by client ID
     */
    List<AdvertisementDetails> findByClientId(Long clientId);

    /**
     * Find all advertisement details by client ID with ordering
     */
    List<AdvertisementDetails> findByClientIdOrderByCreatedAtDesc(Long clientId);

    /**
     * Find advertisement details by client email
     */
    List<AdvertisementDetails> findByClientEmail(String clientEmail);

    /**
     * Find advertisement details created within a date range
     */
    @Query("SELECT ad FROM AdvertisementDetails ad WHERE ad.createdAt BETWEEN :startDate AND :endDate ORDER BY ad.createdAt DESC")
    List<AdvertisementDetails> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate,
                                                      @Param("endDate") LocalDateTime endDate);

    /**
     * Count advertisement details by client ID
     */
    long countByClientId(Long clientId);

    /**
     * Find advertisement details by campaign name
     */
    List<AdvertisementDetails> findByCampaignNameContainingIgnoreCase(String campaignName);
}