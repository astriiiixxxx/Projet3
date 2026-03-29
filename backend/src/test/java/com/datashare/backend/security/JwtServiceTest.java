package com.datashare.backend.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.datashare.backend.entity.User;
import io.jsonwebtoken.ExpiredJwtException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

class JwtServiceTest {

    private static final String TEST_SECRET_BASE64 = Base64.getEncoder()
        .encodeToString("abcdefghijklmnopqrstuvwxyz012345".getBytes(StandardCharsets.UTF_8));

    private final JwtService jwtService = new JwtService();

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtService, "jwtSecret", TEST_SECRET_BASE64);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86_400_000L);
    }

    @Test
    void extractUsername_shouldThrowExpiredJwtException_whenTokenIsExpired() throws Exception {
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 1L);

        User user = new User();
        user.setEmail("user@datashare.com");
        String token = jwtService.generateToken(user);

        Thread.sleep(50L);

        assertThrows(ExpiredJwtException.class, () -> jwtService.extractUsername(token));
    }

    @Test
    void isTokenValid_shouldReturnFalse_whenUsernameDoesNotMatch() {
        User user = new User();
        user.setEmail("user@datashare.com");
        String token = jwtService.generateToken(user);

        UserDetails otherUser = org.springframework.security.core.userdetails.User
            .withUsername("other@datashare.com")
            .password("x")
            .roles("USER")
            .build();

        assertFalse(jwtService.isTokenValid(token, otherUser));
    }

    @Test
    void isTokenValid_shouldReturnTrue_whenTokenIsValidForUser() {
        User user = new User();
        user.setEmail("user@datashare.com");
        String token = jwtService.generateToken(user);

        UserDetails sameUser = org.springframework.security.core.userdetails.User
            .withUsername("user@datashare.com")
            .password("x")
            .roles("USER")
            .build();

        assertTrue(jwtService.isTokenValid(token, sameUser));
    }
}
