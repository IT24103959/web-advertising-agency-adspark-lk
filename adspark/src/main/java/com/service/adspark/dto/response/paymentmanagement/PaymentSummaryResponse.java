package com.service.adspark.dto.response.paymentmanagement;

import com.service.adspark.model.enums.PaymentStatus;
import com.service.adspark.model.enums.PaymentMethod;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSummaryResponse {

    // Basic payment information
    private Long id;
    private String paymentReference;
    private BigDecimal amount;
    private PaymentStatus status;
    private PaymentMethod paymentMethod;
    private String transactionId;
    private String invoiceNumber;
    private LocalDate dueDate;
    private LocalDateTime paidDate;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // User information (visible to finance team)
    private String clientUsername;
    private String clientEmail;
    private String clientFullName;

    // Advertisement information (visible to both)
    private Long advertisementId;
    private String advertisementTitle;
    private String advertisementClientName;

    // Status indicators
    private Boolean isOverdue;
    private Boolean isPaid;
    private Integer daysSinceCreated;
    private Integer daysUntilDue;

    // Payment method details (if available)
    private String gatewayResponse;

    // Aggregated information (for finance team view)
    private BigDecimal userTotalPaid;
    private BigDecimal userTotalPending;
    private Long userTotalPayments;
}