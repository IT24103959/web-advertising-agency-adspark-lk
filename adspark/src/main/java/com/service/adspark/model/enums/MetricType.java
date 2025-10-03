package com.service.adspark.model.enums;

public enum MetricType {
    DAILY("Daily"),
    WEEKLY("Weekly"),
    MONTHLY("Monthly"),
    YEARLY("Yearly"),
    CUSTOM("Custom Range");

    private final String displayName;

    MetricType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}