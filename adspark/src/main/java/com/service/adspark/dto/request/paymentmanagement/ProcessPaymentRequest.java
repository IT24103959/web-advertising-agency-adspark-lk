package com.service.adspark.dto.request.paymentmanagement;


import com.service.adspark.model.enums.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcessPaymentRequest {

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    @NotBlank(message = "Transaction ID is required")
    private String transactionId;

    // Additional payment gateway information
    private String gatewayResponse;

    // Optional fields for different payment methods
    private String cardNumber; // Last 4 digits only for security
    private String cardHolderName;
    private String bankName;
    private String accountNumber; // Last 4 digits only

    // Payment confirmation details
    private String confirmationCode;
    private String notes;
}