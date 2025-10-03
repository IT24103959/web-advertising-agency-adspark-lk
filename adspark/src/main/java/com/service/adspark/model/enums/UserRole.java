package com.service.adspark.model.enums;

public enum UserRole {
    SYSTEM_ADMIN("System Administrator"),
    MARKETING_MANAGER("Marketing Manager"),
    GRAPHIC_DESIGNER("Graphic Designer"),
    IT_SUPPORT("IT Support"),
    CUSTOMER_SUPPORT("Customer Support"),
    FINANCE_TEAM("Finance Team"),
    CLIENT("Client");

    private final String displayName;

    UserRole(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}