package com.service.adspark.model.enums;

public enum EventType {
    CLICK("Click"),
    VIEW("View"),
    IMPRESSION("Impression");

    private final String displayName;

    EventType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}