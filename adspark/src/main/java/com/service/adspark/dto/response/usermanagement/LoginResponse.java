package com.service.adspark.dto.response.usermanagement;


import lombok.Data;

@Data
public class LoginResponse {

    private String message;
    private boolean success;
    private UserResponse user;

    public LoginResponse(boolean success, String message, UserResponse user) {
        this.success = success;
        this.message = message;
        this.user = user;
    }

    public static LoginResponse success(UserResponse user) {
        return new LoginResponse(true, "Login successful", user);
    }

    public static LoginResponse failure(String message) {
        return new LoginResponse(false, message, null);
    }
}