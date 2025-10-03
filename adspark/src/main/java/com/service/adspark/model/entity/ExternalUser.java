package com.service.adspark.model.entity;

import com.service.adspark.model.enums.UserRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "external_users")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@DiscriminatorValue("EXTERNAL")
public class ExternalUser extends User {

    @Column(name = "business_type")
    private String businessType;

    @Column(name = "industry")
    private String industry;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "tax_id")
    private String taxId;

    @Column(name = "billing_address")
    private String billingAddress;

    @Column(name = "account_manager_id")
    private Long accountManagerId;

    // Constructor for creating external users (clients)
    public ExternalUser(String username, String email, String password, String firstName,
                        String lastName, String companyName, String businessType) {
        super();
        this.setUsername(username);
        this.setEmail(email);
        this.setPassword(password);
        this.setFirstName(firstName);
        this.setLastName(lastName);
        this.setRole(UserRole.CLIENT);
        this.setCompanyName(companyName);
        this.businessType = businessType;
    }

    @Override
    public boolean isInternalUser() {
        return false;
    }

    @Override
    public boolean isClient() {
        return true;
    }
}