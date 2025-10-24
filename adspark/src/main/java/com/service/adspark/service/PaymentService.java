package com.service.adspark.service;

import com.service.adspark.dto.request.paymentmanagement.CreatePaymentRequest;
import com.service.adspark.dto.response.paymentmanagement.PaymentResponse;
import com.service.adspark.dto.response.paymentmanagement.PaymentSummaryResponse;
import com.service.adspark.dto.request.paymentmanagement.ProcessPaymentRequest;
import com.service.adspark.model.entity.Advertisement;
import com.service.adspark.model.entity.Payment;
import com.service.adspark.model.entity.User;
import com.service.adspark.model.enums.PaymentStatus;
import com.service.adspark.model.enums.UserRole;
import com.service.adspark.repository.AdvertisementRepository;
import com.service.adspark.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final AdvertisementRepository advertRepository;
    private final UserService userService;

    /**
     * Create a new payment (Financial team only)
     */
    public PaymentResponse createPayment(CreatePaymentRequest request, String createdByUsername) {
        log.info("Creating payment for advertisement ID: {} by user: {}",
                request.getAdvertisementId(), createdByUsername);

        // Get the user who is creating the payment (must be financial team)
        User createdByUser = getUserByUsername(createdByUsername);
        // Validate that only financial team members can create payments
        if (!isFinancialTeamMember(createdByUser)) {
            throw new RuntimeException("Only financial team members can create payments");
        }
        log.info("Creating payment");

        // Get the advertisement
        Advertisement advertisement = advertRepository.findById(request.getAdvertisementId())
                .orElseThrow(
                        () -> new RuntimeException("Advertisement not found with ID: " + request.getAdvertisementId()));

        // Get the client user
        User clientUser = userService.findById(request.getClientUserId())
                .orElseThrow(() -> new RuntimeException("Client user not found with ID: " + request.getClientUserId()));

        // Validate that the target user is a client
        if (clientUser.getRole() != UserRole.CLIENT) {
            throw new RuntimeException("Payment can only be assigned to client users");
        }

        // Check if payment with same invoice number already exists
        if (paymentRepository.findByInvoiceNumber(request.getInvoiceNumber()).isPresent()) {
            throw new RuntimeException("Payment with invoice number already exists: " + request.getInvoiceNumber());
        }

        // Create payment entity
        Payment payment = new Payment();
        payment.setPaymentReference(generatePaymentReference());
        payment.setAmount(request.getAmount());
        payment.setInvoiceNumber(request.getInvoiceNumber());
        payment.setDescription(request.getDescription());
        payment.setDueDate(request.getDueDate());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setTransactionId(generateTransactionId()); // Generate transaction ID during creation
        payment.setUser(clientUser);
        payment.setAdvertisement(advertisement);

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Payment created successfully with ID: {} and reference: {}",
                savedPayment.getId(), savedPayment.getPaymentReference());

        return mapToPaymentResponse(savedPayment);
    }

    /**
     * Process payment (Client pays the bill)
     */
    public PaymentResponse processPayment(Long paymentId, ProcessPaymentRequest request, String payingUsername) {
        log.info("Processing payment ID: {} by user: {}", paymentId, payingUsername);

        User payingUser = getUserByUsername(payingUsername);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + paymentId));

        // Check if user can pay this payment
        if (!canUserPayPayment(payingUser, payment)) {
            throw new RuntimeException("Access denied: You don't have permission to pay this bill");
        }

        // Check if payment is in a payable state
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new RuntimeException("Payment cannot be processed. Current status: " + payment.getStatus());
        }

        // Update payment with payment details
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setTransactionId(request.getTransactionId());
        payment.setGatewayResponse(request.getGatewayResponse());
        payment.setStatus(PaymentStatus.PROCESSING);
        payment.setPaidDate(LocalDateTime.now());

        // In a real system, here you would integrate with payment gateway
        // For now, we'll simulate successful payment processing
        try {
            // Simulate payment gateway processing
            boolean paymentSuccess = simulatePaymentGateway(payment, request);

            if (paymentSuccess) {
                payment.setStatus(PaymentStatus.COMPLETED);
                log.info("Payment processed successfully: {}", payment.getPaymentReference());
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                log.warn("Payment processing failed: {}", payment.getPaymentReference());
            }
        } catch (Exception e) {
            payment.setStatus(PaymentStatus.FAILED);
            log.error("Payment processing error: {}", e.getMessage());
        }

        Payment savedPayment = paymentRepository.save(payment);
        return mapToPaymentResponse(savedPayment);
    }

    /**
     * Get payment status
     */
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentStatus(Long paymentId, String requestingUsername) {
        log.info("Getting payment status for ID: {} by user: {}", paymentId, requestingUsername);

        User requestingUser = getUserByUsername(requestingUsername);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + paymentId));

        // Check access permissions
        if (!canUserAccessPayment(requestingUser, payment)) {
            throw new RuntimeException("Access denied: You don't have permission to view this payment");
        }

        return mapToPaymentResponse(payment);
    }

    /**
     * Check if user can access a payment
     */
    private boolean canUserAccessPayment(User user, Payment payment) {
        // Financial team members can access all payments
        if (isFinancialTeamMember(user)) {
            return true;
        }

        // Clients can only access their own payments
        if (user.getRole() == UserRole.CLIENT) {
            return payment.getUser().getId().equals(user.getId());
        }

        return false;
    }

    /**
     * Check if user can pay a payment
     */
    private boolean canUserPayPayment(User user, Payment payment) {
        // Only the assigned client can pay their own bill
        return user.getRole() == UserRole.CLIENT &&
                payment.getUser().getId().equals(user.getId());
    }

    /**
     * Check if user is financial team member
     */
    private boolean isFinancialTeamMember(User user) {
        return user.getRole() == UserRole.FINANCE_TEAM || user.getRole() == UserRole.SYSTEM_ADMIN
                || user.getRole() == UserRole.MARKETING_MANAGER;
    }

    /**
     * Generate unique payment reference
     */
    private String generatePaymentReference() {
        return "PAY-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Generate a unique transaction ID
     */
    private String generateTransactionId() {
        return "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Simulate payment gateway processing
     */
    private boolean simulatePaymentGateway(Payment payment, ProcessPaymentRequest request) {
        // In a real system, this would call actual payment gateway APIs
        // For simulation, we'll just return true (successful payment)
        log.info("Simulating payment gateway for amount: {} using method: {}",
                payment.getAmount(), request.getPaymentMethod());

        // Simulate 95% success rate
        return Math.random() > 0.05;
    }

    /**
     * Get user by username
     */
    private User getUserByUsername(String username) {
        return userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    /**
     * Map Payment entity to PaymentResponse DTO
     */
    private PaymentResponse mapToPaymentResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setPaymentReference(payment.getPaymentReference());
        response.setAmount(payment.getAmount());
        response.setStatus(payment.getStatus());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setTransactionId(payment.getTransactionId());
        response.setInvoiceNumber(payment.getInvoiceNumber());
        response.setDueDate(payment.getDueDate());
        response.setPaidDate(payment.getPaidDate());
        response.setDescription(payment.getDescription());
        response.setCreatedAt(payment.getCreatedAt());
        response.setUpdatedAt(payment.getUpdatedAt());

        // Set client information
        if (payment.getUser() != null) {
            response.setClientUsername(payment.getUser().getUsername());
            response.setClientEmail(payment.getUser().getEmail());
            response.setClientCompanyName(payment.getUser().getCompanyName());
        }

        // Set advertisement information
        if (payment.getAdvertisement() != null) {
            response.setAdvertisementId(payment.getAdvertisement().getId());
            response.setAdvertisementTitle(payment.getAdvertisement().getTitle());
        }

        // Set computed fields
        response.setPaid(payment.isPaid());
        response.setOverdue(payment.isOverdue());

        // Calculate days until/past due
        if (payment.getDueDate() != null) {
            LocalDateTime now = LocalDateTime.now();
            long daysDiff = ChronoUnit.DAYS.between(now, payment.getDueDate());

            if (daysDiff > 0) {
                response.setDaysUntilDue(daysDiff);
                response.setDaysPastDue(0);
            } else {
                response.setDaysUntilDue(0);
                response.setDaysPastDue(Math.abs(daysDiff));
            }
        }

        // Set sensitive information based on payment method
        if (payment.getPaymentMethod() != null) {
            response.setGatewayResponse(payment.getGatewayResponse());
            // Note: In a real system, you'd be more careful about exposing sensitive data
        }

        return response;
    }

    @Transactional(readOnly = true)
    public List<PaymentSummaryResponse> getPaymentSummaries(String requestingUsername) {
        log.info("Getting payment summaries for user: {}", requestingUsername);

        User requestingUser = getUserByUsername(requestingUsername);
        List<Payment> payments;

        // Get payments based on user role
        if (isFinancialTeamMember(requestingUser)) {
            // Finance team can see all payments
            payments = paymentRepository.findAll();
            log.info("Finance team user {} retrieving {} total payments", requestingUsername, payments.size());
        } else {
            // Clients can only see their own payments
            payments = paymentRepository.findByUser(requestingUser);
            log.info("Client user {} retrieving {} personal payments", requestingUsername, payments.size());
        }

        return payments.stream()
                .map(payment -> mapToPaymentSummary(payment, isFinancialTeamMember(requestingUser)))
                .collect(Collectors.toList());
    }

    /**
     * Map Payment entity to PaymentSummaryResponse DTO
     */
    private PaymentSummaryResponse mapToPaymentSummary(Payment payment, boolean isFinanceUser) {
        PaymentSummaryResponse summary = new PaymentSummaryResponse();

        // Basic payment information (visible to all)
        summary.setId(payment.getId());
        summary.setPaymentReference(payment.getPaymentReference());
        summary.setAmount(payment.getAmount());
        summary.setStatus(payment.getStatus());
        summary.setPaymentMethod(payment.getPaymentMethod());
        summary.setTransactionId(payment.getTransactionId());
        summary.setInvoiceNumber(payment.getInvoiceNumber());
        summary.setDueDate(payment.getDueDate());
        summary.setPaidDate(payment.getPaidDate());
        summary.setDescription(payment.getDescription());
        summary.setCreatedAt(payment.getCreatedAt());
        summary.setUpdatedAt(payment.getUpdatedAt());

        // Status indicators
        summary.setIsOverdue(payment.isOverdue());
        summary.setIsPaid(payment.isPaid());

        // Calculate days since created and until due
        LocalDateTime now = LocalDateTime.now();
        summary.setDaysSinceCreated((int) ChronoUnit.DAYS.between(payment.getCreatedAt(), now));

        if (payment.getDueDate() != null) {
            long daysUntilDue = ChronoUnit.DAYS.between(LocalDate.now(), payment.getDueDate());
            summary.setDaysUntilDue((int) daysUntilDue);
        }

        // Client information (visible to finance team or the client themselves)
        if (payment.getUser() != null) {
            summary.setClientUsername(payment.getUser().getUsername());
            summary.setClientEmail(payment.getUser().getEmail());
            summary.setClientFullName(payment.getUser().getFullName());
        }

        // Advertisement information
        if (payment.getAdvertisement() != null) {
            summary.setAdvertisementId(payment.getAdvertisement().getId());
            summary.setAdvertisementTitle(payment.getAdvertisement().getTitle());
            summary.setAdvertisementClientName(payment.getAdvertisement().getClientName());
        }

        // Detailed information (visible to finance team only)
        if (isFinanceUser) {
            summary.setGatewayResponse(payment.getGatewayResponse());

            // Calculate aggregated information for the client
            if (payment.getUser() != null) {
                try {
                    BigDecimal userTotalPaid = paymentRepository
                            .findByUserAndStatus(payment.getUser(), PaymentStatus.COMPLETED)
                            .stream()
                            .map(Payment::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal userTotalPending = paymentRepository
                            .findByUserAndStatus(payment.getUser(), PaymentStatus.PENDING)
                            .stream()
                            .map(Payment::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    Long userTotalPayments = paymentRepository.countByUser(payment.getUser());

                    summary.setUserTotalPaid(userTotalPaid);
                    summary.setUserTotalPending(userTotalPending);
                    summary.setUserTotalPayments(userTotalPayments);
                } catch (Exception e) {
                    log.warn("Could not calculate aggregated payment data for user {}: {}",
                            payment.getUser().getUsername(), e.getMessage());
                }
            }
        }

        return summary;
    }
}