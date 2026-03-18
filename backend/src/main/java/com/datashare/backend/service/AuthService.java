package com.datashare.backend.service;

import com.datashare.backend.dto.AuthResponse;
import com.datashare.backend.dto.LoginRequest;
import com.datashare.backend.dto.RegisterRequest;
import com.datashare.backend.dto.UserResponse;
import com.datashare.backend.entity.User;
import com.datashare.backend.repository.UserRepository;
import com.datashare.backend.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,
        AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public UserResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        System.out.println("REGISTER START: " + normalizedEmail);

        if (userRepository.existsByEmail(normalizedEmail)) {
            System.out.println("EMAIL ALREADY EXISTS");
            throw new IllegalArgumentException("cet email est déjà utilisé");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        System.out.println("BEFORE SAVE");
        User savedUser = userRepository.save(user);
        System.out.println("AFTER SAVE: " + savedUser.getId());

        return new UserResponse(savedUser.getId(), savedUser.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                normalizedEmail,
                request.password()
            )
        );

        User user = userRepository.findByEmail(normalizedEmail)
            .orElseThrow(() -> new IllegalArgumentException("utilisateur introuvable"));

        String token = jwtService.generateToken(user);

        return new AuthResponse(
            token,
            new UserResponse(user.getId(), user.getEmail())
        );
    }
}