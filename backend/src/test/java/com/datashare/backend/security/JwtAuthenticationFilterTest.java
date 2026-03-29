package com.datashare.backend.security;

import static org.junit.jupiter.api.Assertions.assertNull;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

class JwtAuthenticationFilterTest {

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldNotAuthenticate_whenJwtParsingFails() throws Exception {
        JwtService jwtService = new JwtService() {
            @Override
            public String extractUsername(String token) {
                throw new JwtException("invalid");
            }
        };
        UserDetailsService userDetailsService = username -> {
            throw new IllegalStateException("ne doit pas être appelé");
        };

        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtService, userDetailsService);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServletPath("/api/files");
        request.addHeader("Authorization", "Bearer bad-token");

        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void shouldNotAuthenticate_whenUserNotFound() throws Exception {
        JwtService jwtService = new JwtService() {
            @Override
            public String extractUsername(String token) {
                return "gone@datashare.com";
            }
        };

        UserDetailsService userDetailsService = username -> {
            throw new UsernameNotFoundException("not found");
        };

        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtService, userDetailsService);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServletPath("/api/files");
        request.addHeader("Authorization", "Bearer valid-looking-token");

        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
}
