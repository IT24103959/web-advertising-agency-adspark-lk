package com.service.adspark.model.enums;

public enum AdFormat {
    IMAGE("Image"),
    VIDEO("Video"),
    BANNER("Banner"),
    AUDIO("Audio"),
    GIF("GIF"),
    CAROUSEL("Carousel");

    private final String displayName;

    AdFormat(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}