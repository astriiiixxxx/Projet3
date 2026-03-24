package com.datashare.backend.controller;

import com.datashare.backend.dto.FileHistoryResponse;
import com.datashare.backend.dto.PublicFileResponse;
import com.datashare.backend.dto.UploadFileResponse;
import com.datashare.backend.entity.User;
import com.datashare.backend.exception.FileNotFoundException;
import com.datashare.backend.exception.GlobalExceptionHandler;
import com.datashare.backend.exception.InvalidFilePasswordException;
import com.datashare.backend.repository.UserRepository;
import com.datashare.backend.service.FileService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.ArgumentMatchers.same;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
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
    void uploadFile_shouldUploadForAuthenticatedUser() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@datashare.com");

        MockMultipartFile file = new MockMultipartFile(
            "file",
            "document.pdf",
            "application/pdf",
            "hello".getBytes()
        );

        UploadFileResponse response = new UploadFileResponse(
            1L,
            "document.pdf",
            "token-123",
            "http://localhost:5173/download/token-123",
            LocalDateTime.now(),
            LocalDateTime.now().plusDays(5),
            true
        );

        when(userRepository.findByEmail("test@datashare.com"))
            .thenReturn(Optional.of(user));
        when(fileService.upload(same(file), org.mockito.ArgumentMatchers.eq(5), org.mockito.ArgumentMatchers.eq("secret123"), same(user)))
            .thenReturn(response);

        mockMvc.perform(
                multipart("/api/files")
                    .file(file)
                    .param("expirationDays", "5")
                    .param("password", "secret123")
                    .principal(new UsernamePasswordAuthenticationToken(
                        "test@datashare.com",
                        null
                    ))
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.originalFilename").value("document.pdf"))
            .andExpect(jsonPath("$.downloadToken").value("token-123"))
            .andExpect(jsonPath("$.passwordProtected").value(true));
    }

    @Test
    void uploadAnonymousFile_shouldUploadWithoutAuthentication() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "document.pdf",
            "application/pdf",
            "hello".getBytes()
        );

        UploadFileResponse response = new UploadFileResponse(
            2L,
            "document.pdf",
            "token-anon",
            "http://localhost:5173/download/token-anon",
            LocalDateTime.now(),
            LocalDateTime.now().plusDays(3),
            false
        );

        when(fileService.upload(same(file), org.mockito.ArgumentMatchers.eq(3), isNull(), isNull()))
            .thenReturn(response);

        mockMvc.perform(
                multipart("/api/files/anonymous")
                    .file(file)
                    .param("expirationDays", "3")
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(2))
            .andExpect(jsonPath("$.originalFilename").value("document.pdf"))
            .andExpect(jsonPath("$.downloadToken").value("token-anon"))
            .andExpect(jsonPath("$.passwordProtected").value(false));
    }

    @Test
    void getMyFiles_shouldReturnCurrentUserHistory() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@datashare.com");

        FileHistoryResponse historyItem = new FileHistoryResponse(
            1L,
            "document.pdf",
            1200L,
            LocalDateTime.now().minusHours(1),
            LocalDateTime.now().plusDays(1),
            false,
            true,
            "token-123",
            "http://localhost:5173/download/token-123"
        );

        when(userRepository.findByEmail("test@datashare.com"))
            .thenReturn(Optional.of(user));
        when(fileService.getMyFiles(user))
            .thenReturn(List.of(historyItem));

        mockMvc.perform(
                get("/api/files")
                    .principal(new UsernamePasswordAuthenticationToken(
                        "test@datashare.com",
                        null
                    ))
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[0].originalFilename").value("document.pdf"))
            .andExpect(jsonPath("$[0].size").value(1200))
            .andExpect(jsonPath("$[0].expired").value(false))
            .andExpect(jsonPath("$[0].passwordProtected").value(true))
            .andExpect(jsonPath("$[0].downloadToken").value("token-123"))
            .andExpect(jsonPath("$[0].downloadUrl").value("http://localhost:5173/download/token-123"));
    }

    @Test
    void deleteMyFile_shouldReturn204_whenOwnerDeletesOwnFile() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@datashare.com");

        when(userRepository.findByEmail("test@datashare.com"))
            .thenReturn(Optional.of(user));
        doNothing().when(fileService).deleteMyFile(10L, user);

        mockMvc.perform(
                delete("/api/files/10")
                    .principal(new UsernamePasswordAuthenticationToken(
                        "test@datashare.com",
                        null
                    ))
            )
            .andExpect(status().isNoContent());
    }

    @Test
    void deleteMyFile_shouldReturn404_whenFileDoesNotExist() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@datashare.com");

        when(userRepository.findByEmail("test@datashare.com"))
            .thenReturn(Optional.of(user));
        doThrow(new FileNotFoundException("Fichier introuvable."))
            .when(fileService).deleteMyFile(99L, user);

        mockMvc.perform(
                delete("/api/files/99")
                    .principal(new UsernamePasswordAuthenticationToken(
                        "test@datashare.com",
                        null
                    ))
            )
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.message").value("Fichier introuvable."));
    }

    @Test
    void deleteMyFile_shouldReturn403_whenUserDeletesAnotherUsersFile() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@datashare.com");

        when(userRepository.findByEmail("test@datashare.com"))
            .thenReturn(Optional.of(user));
        doThrow(new AccessDeniedException("Accès interdit à ce fichier."))
            .when(fileService).deleteMyFile(20L, user);

        mockMvc.perform(
                delete("/api/files/20")
                    .principal(new UsernamePasswordAuthenticationToken(
                        "test@datashare.com",
                        null
                    ))
            )
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.message").value("Accès interdit à ce fichier."));
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
            "http://localhost:5173/download/token-123"
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