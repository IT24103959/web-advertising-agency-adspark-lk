package com.service.adspark.model.entity;

import com.service.adspark.model.enums.UserRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "internal_users")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@DiscriminatorValue("INTERNAL")
public class InternalUser extends User {

    @Column(name = "employee_id", unique = true)
    private String employeeId;

    @Column(name = "department")
    private String department;

    @Column(name = "manager_id")
    private Long managerId;

    @Column(name = "office_location")
    private String officeLocation;

    @Column(name = "access_level")
    private Integer accessLevel;

    // Constructor for creating internal users with specific roles
    public InternalUser(String username, String email, String password, String firstName,
                        String lastName, UserRole role, String employeeId, String department) {
        super();
        this.setUsername(username);
        this.setEmail(email);
        this.setPassword(password);
        this.setFirstName(firstName);
        this.setLastName(lastName);
        this.setRole(role);
        this.employeeId = employeeId;
        this.department = department;
    }

    @Override
    public boolean isInternalUser() {
        return true;
    }

    @Override
    public boolean isClient() {
        return false;
    }
}