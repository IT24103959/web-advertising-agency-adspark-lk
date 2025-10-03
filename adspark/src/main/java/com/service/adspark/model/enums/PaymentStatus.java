package com.service.adspark.model.enums;

public enum PaymentStatus {
    PENDING("Pending"),
    PROCESSING("Processing"),
    COMPLETED("Completed"),
    FAILED("Failed"),
    CANCELLED("Cancelled"),
    REFUNDED("Refunded");

    private final String displayName;

    PaymentStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}