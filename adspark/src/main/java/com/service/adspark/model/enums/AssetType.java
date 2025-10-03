package com.service.adspark.model.enums;

public enum AssetType {
    IMAGE("Image"),
    VIDEO("Video"),
    AUDIO("Audio"),
    DOCUMENT("Document"),
    TEMPLATE("Template"),
    LOGO("Logo"),
    ICON("Icon"),
    FONT("Font");

    private final String displayName;

    AssetType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}