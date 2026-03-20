package com.datashare.backend.controller;

import com.datashare.backend.dto.PublicFileResponse;
import com.datashare.backend.exception.GlobalExceptionHandler;
import com.datashare.backend.exception.InvalidFilePasswordException;
import com.datashare.backend.repository.UserRepository;
import com.datashare.backend.service.FileService;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class FileControllerTest {

    private MockMvc mockMvc;
    private FileService fileService;
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        fileService = mock(FileService.class);
        userRepository = mock(UserRepository.class);

        FileController fileController = new FileController(fileService, userRepository);

        mockMvc = MockMvcBuilders.standaloneSetup(fileController)
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
    }

    @Test
    void getPublicFile_shouldReturnPasswordProtectedField() throws Exception {
        PublicFileResponse response = new PublicFileResponse(
            "document.pdf",
            "application/pdf",
            1200L,
            LocalDateTime.now().minusHours(1),
            LocalDateTime.now().plusDays(1),
            false,
            true,
            "/api/files/download/token-123"
        );

        when(fileService.getPublicFile("token-123")).thenReturn(response);

        mockMvc.perform(get("/api/files/public/token-123"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.originalFilename").value("document.pdf"))
            .andExpect(jsonPath("$.passwordProtected").value(true));
    }

    @Test
    void downloadFile_shouldReturn401_whenPasswordIsMissingForProtectedFile() throws Exception {
        when(fileService.downloadFile("token-123", null))
            .thenThrow(new InvalidFilePasswordException("Le mot de passe est requis pour télécharger ce fichier."));

        mockMvc.perform(get("/api/files/download/token-123"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.message").value("Le mot de passe est requis pour télécharger ce fichier."));
    }

    @Test
    void downloadFile_shouldReturn401_whenPasswordIsIncorrect() throws Exception {
        when(fileService.downloadFile("token-123", "wrong-password"))
            .thenThrow(new InvalidFilePasswordException("Mot de passe invalide."));

        mockMvc.perform(
                get("/api/files/download/token-123")
                    .header("X-File-Password", "wrong-password")
            )
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.message").value("Mot de passe invalide."));
    }

    @Test
    void downloadFile_shouldReturn200_whenPasswordIsCorrect() throws Exception {
        Resource resource = new ByteArrayResource("hello".getBytes());

        when(fileService.downloadFile("token-123", "secret123"))
            .thenReturn(
                ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"document.pdf\"")
                    .body(resource)
            );

        mockMvc.perform(
                get("/api/files/download/token-123")
                    .header("X-File-Password", "secret123")
            )
            .andExpect(status().isOk());
    }
}