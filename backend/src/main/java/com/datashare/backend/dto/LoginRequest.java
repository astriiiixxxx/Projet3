package com.datashare.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @Email(message = "email invalide")
    @NotBlank(message = "email obligatoire")
    String email,

    @NotBlank(message = "mot de passe obligatoire")
    String password
) {}