package com.service.adspark.model.enums;

public enum TicketStatus {
    OPEN("Open"),
    IN_PROGRESS("In Progress"),
    PENDING_CUSTOMER("Pending Customer"),
    RESOLVED("Resolved"),
    CLOSED("Closed");

    private final String displayName;

    TicketStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}