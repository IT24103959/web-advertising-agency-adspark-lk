package com.service.adspark.dto.response.paymentmanagement;

import com.service.adspark.model.enums.PaymentMethod;
import com.service.adspark.model.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Long id;
    private String paymentReference;
    private BigDecimal amount;
    private PaymentStatus status;
    private PaymentMethod paymentMethod;
    private String transactionId;
    private String invoiceNumber;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dueDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime paidDate;

    private String description;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    // Client information
    private String clientUsername;
    private String clientEmail;
    private String clientCompanyName;

    // Advertisement information
    private Long advertisementId;
    private String advertisementTitle;

    // Payment status helpers
    private boolean isPaid;
    private boolean isOverdue;
    private long daysUntilDue;
    private long daysPastDue;

    // Financial information
    private String gatewayResponse;
    private String lastFourDigits; // For card payments
    private String bankName; // For bank transfers
}