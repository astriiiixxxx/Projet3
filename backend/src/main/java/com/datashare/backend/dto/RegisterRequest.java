package com.datashare.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @Email(message = "email invalide")
    @NotBlank(message = "email obligatoire")
    String email,

    @NotBlank(message = "mot de passe obligatoire")
    @Size(min = 8, message = "le mot de passe doit contenir au moins 8 caractères")
    String password
) {}