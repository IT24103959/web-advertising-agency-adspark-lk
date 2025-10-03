package com.service.adspark.repository;


import com.service.adspark.model.entity.Advertisement;
import com.service.adspark.model.entity.User;
import com.service.adspark.model.enums.AdStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AdvertisementRepository extends JpaRepository<Advertisement, Long> {

    // Find by status
    List<Advertisement> findByStatus(AdStatus status);

    // Find by client name (case insensitive)
    List<Advertisement> findByClientNameContainingIgnoreCase(String clientName);

    // Find by creator
    List<Advertisement> findByCreatedBy(User createdBy);

    // Find by assigned user
    List<Advertisement> findByAssignedTo(User assignedTo);

    // Find by budget range
    List<Advertisement> findByBudgetBetween(BigDecimal minBudget, BigDecimal maxBudget);

    // Find by creation date range
    List<Advertisement> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Find by priority level
    List<Advertisement> findByPriorityLevel(Integer priorityLevel);

    // Complex search query
    @Query("SELECT a FROM Advertisement a WHERE " +
            "(:title IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:clientName IS NULL OR LOWER(a.clientName) LIKE LOWER(CONCAT('%', :clientName, '%'))) AND " +
            "(:status IS NULL OR a.status = :status) AND " +
            "(:createdBy IS NULL OR a.createdBy = :createdBy) AND " +
            "(:assignedTo IS NULL OR a.assignedTo = :assignedTo) AND " +
            "(:minBudget IS NULL OR a.budget >= :minBudget) AND " +
            "(:maxBudget IS NULL OR a.budget <= :maxBudget) AND " +
            "(:priorityLevel IS NULL OR a.priorityLevel = :priorityLevel)")
    Page<Advertisement> findAdvertsWithFilters(
            @Param("title") String title,
            @Param("clientName") String clientName,
            @Param("status") AdStatus status,
            @Param("createdBy") User createdBy,
            @Param("assignedTo") User assignedTo,
            @Param("minBudget") BigDecimal minBudget,
            @Param("maxBudget") BigDecimal maxBudget,
            @Param("priorityLevel") Integer priorityLevel,
            Pageable pageable);

    // Count adverts by status
    long countByStatus(AdStatus status);

    // Count adverts by creator
    long countByCreatedBy(User createdBy);

    // Find active adverts (useful for dashboard)
    @Query("SELECT a FROM Advertisement a WHERE a.status = 'ACTIVE' ORDER BY a.createdAt DESC")
    List<Advertisement> findActiveAdverts();

    // Find recent adverts (last 30 days)
    @Query("SELECT a FROM Advertisement a WHERE a.createdAt >= :dateFrom ORDER BY a.createdAt DESC")
    List<Advertisement> findRecentAdverts(@Param("dateFrom") LocalDateTime dateFrom);

    // Find adverts by deadline (end date approaching)
    @Query("SELECT a FROM Advertisement a WHERE a.endDate IS NOT NULL AND a.endDate <= :deadline AND a.status IN ('ACTIVE', 'APPROVED') ORDER BY a.endDate ASC")
    List<Advertisement> findAdvertsWithUpcomingDeadline(@Param("deadline") LocalDate deadline);

    // Find overdue adverts
    @Query("SELECT a FROM Advertisement a WHERE a.endDate IS NOT NULL AND a.endDate < CURRENT_DATE AND a.status NOT IN ('COMPLETED', 'ARCHIVED') ORDER BY a.endDate ASC")
    List<Advertisement> findOverdueAdverts();

    // Get total budget by status
    @Query("SELECT COALESCE(SUM(a.budget), 0) FROM Advertisement a WHERE a.status = :status")
    BigDecimal getTotalBudgetByStatus(@Param("status") AdStatus status);
}