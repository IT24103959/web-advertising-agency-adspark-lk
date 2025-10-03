package com.service.adspark.model.enums;

public enum AdStatus {
    DRAFT("Draft"),
    PENDING_APPROVAL("Pending Approval"),
    APPROVED("Approved"),
    ACTIVE("Active"),
    PAUSED("Paused"),
    COMPLETED("Completed"),
    REJECTED("Rejected"),
    ARCHIVED("Archived");

    private final String displayName;

    AdStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}