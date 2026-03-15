package com.datashare.backend.dto;

public record AuthResponse(
    String token,
    UserResponse user
) {}