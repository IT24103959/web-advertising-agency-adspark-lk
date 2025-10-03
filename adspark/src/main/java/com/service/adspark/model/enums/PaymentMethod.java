package com.service.adspark.model.enums;

public enum PaymentMethod {
    CREDIT_CARD("Credit Card"),
    DEBIT_CARD("Debit Card"),
    BANK_TRANSFER("Bank Transfer"),
    PAYPAL("PayPal"),
    STRIPE("Stripe"),
    MOBILE_PAYMENT("Mobile Payment"),
    CASH("Cash");

    private final String displayName;

    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}