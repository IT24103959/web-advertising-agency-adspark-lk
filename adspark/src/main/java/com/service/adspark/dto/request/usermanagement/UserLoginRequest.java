package com.service.adspark.dto.request.usermanagement;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserLoginRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;
}