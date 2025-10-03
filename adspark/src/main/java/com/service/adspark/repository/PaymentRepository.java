package com.service.adspark.repository;

import com.service.adspark.model.entity.Advertisement;
import com.service.adspark.model.entity.Payment;
import com.service.adspark.model.entity.User;
import com.service.adspark.model.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Find by payment reference (unique identifier)
    Optional<Payment> findByPaymentReference(String paymentReference);

    // Find by invoice number
    Optional<Payment> findByInvoiceNumber(String invoiceNumber);

    // Find by transaction ID
    Optional<Payment> findByTransactionId(String transactionId);

    // Find payments by status
    List<Payment> findByStatus(PaymentStatus status);

    // Find payments by user (client)
    List<Payment> findByUser(User user);

    // Find payments by user and status
    List<Payment> findByUserAndStatus(User user, PaymentStatus status);

    // Find payments by advertisement
    List<Payment> findByAdvertisement(Advertisement advertisement);

    // Find payments due within date range
    List<Payment> findByDueDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Find overdue payments
    @Query("SELECT p FROM Payment p WHERE p.dueDate < :currentDate AND p.status NOT IN ('COMPLETED', 'CANCELLED')")
    List<Payment> findOverduePayments(@Param("currentDate") LocalDateTime currentDate);

    // Find payments by amount range
    List<Payment> findByAmountBetween(BigDecimal minAmount, BigDecimal maxAmount);

    // Find payments created within date range
    List<Payment> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Complex search query for payments
    @Query("SELECT p FROM Payment p WHERE " +
            "(:status IS NULL OR p.status = :status) AND " +
            "(:user IS NULL OR p.user = :user) AND " +
            "(:advertisement IS NULL OR p.advertisement = :advertisement) AND " +
            "(:minAmount IS NULL OR p.amount >= :minAmount) AND " +
            "(:maxAmount IS NULL OR p.amount <= :maxAmount) AND " +
            "(:startDate IS NULL OR p.createdAt >= :startDate) AND " +
            "(:endDate IS NULL OR p.createdAt <= :endDate)")
    Page<Payment> findPaymentsWithFilters(
            @Param("status") PaymentStatus status,
            @Param("user") User user,
            @Param("advertisement") Advertisement advertisement,
            @Param("minAmount") BigDecimal minAmount,
            @Param("maxAmount") BigDecimal maxAmount,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    // Count payments by status
    long countByStatus(PaymentStatus status);

    // Count payments by user
    long countByUser(User user);

    // Get total amount by status
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = :status")
    BigDecimal getTotalAmountByStatus(@Param("status") PaymentStatus status);

    // Get total amount for user
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.user = :user")
    BigDecimal getTotalAmountByUser(@Param("user") User user);

    // Get pending payments for user
    @Query("SELECT p FROM Payment p WHERE p.user = :user AND p.status = 'PENDING' ORDER BY p.dueDate ASC")
    List<Payment> findPendingPaymentsForUser(@Param("user") User user);

    // Get recent payments (last 30 days)
    @Query("SELECT p FROM Payment p WHERE p.createdAt >= :dateFrom ORDER BY p.createdAt DESC")
    List<Payment> findRecentPayments(@Param("dateFrom") LocalDateTime dateFrom);

    // Find payments with due date approaching (within specified days)
    @Query("SELECT p FROM Payment p WHERE p.dueDate IS NOT NULL AND p.dueDate <= :deadline AND p.status = 'PENDING' ORDER BY p.dueDate ASC")
    List<Payment> findPaymentsWithUpcomingDueDate(@Param("deadline") LocalDateTime deadline);

    // Check if user has any pending payments
    boolean existsByUserAndStatus(User user, PaymentStatus status);
}