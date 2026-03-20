package com.datashare.backend.service;

import com.datashare.backend.config.FileStorageProperties;
import com.datashare.backend.dto.PublicFileResponse;
import com.datashare.backend.entity.StoredFile;
import com.datashare.backend.exception.InvalidFilePasswordException;
import com.datashare.backend.repository.StoredFileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FileServiceTest {

    @Mock
    private StoredFileRepository storedFileRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private FileStorageProperties properties;

    @InjectMocks
    private FileService fileService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(fileService, "publicBaseUrl", "http://localhost:5173");
    }

    @Test
    void getPublicFile_shouldReturnPasswordProtectedFalse_whenFileIsNotProtected() {
        StoredFile storedFile = buildStoredFile(false);

        when(storedFileRepository.findByDownloadToken("token-123"))
            .thenReturn(Optional.of(storedFile));

        PublicFileResponse response = fileService.getPublicFile("token-123");

        assertNotNull(response);
        assertFalse(response.isPasswordProtected());
        assertEquals("document.pdf", response.getOriginalFilename());
        assertEquals("/api/files/download/token-123", response.getDownloadUrl());
    }

    @Test
    void getPublicFile_shouldReturnPasswordProtectedTrue_whenFileIsProtected() {
        StoredFile storedFile = buildStoredFile(true);

        when(storedFileRepository.findByDownloadToken("token-123"))
            .thenReturn(Optional.of(storedFile));

        PublicFileResponse response = fileService.getPublicFile("token-123");

        assertNotNull(response);
        assertTrue(response.isPasswordProtected());
    }

    @Test
    void downloadFile_shouldSucceedWithoutPassword_whenFileIsNotProtected() {
        StoredFile storedFile = buildStoredFile(false);
        Resource resource = new ByteArrayResource("hello".getBytes());

        when(storedFileRepository.findByDownloadToken("token-123"))
            .thenReturn(Optional.of(storedFile));
        when(fileStorageService.loadAsResource("stored-document.pdf"))
            .thenReturn(resource);

        ResponseEntity<Resource> response = fileService.downloadFile("token-123", null);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void downloadFile_shouldSucceedWithCorrectPassword_whenFileIsProtected() {
        StoredFile storedFile = buildStoredFile(true);
        Resource resource = new ByteArrayResource("hello".getBytes());

        when(storedFileRepository.findByDownloadToken("token-123"))
            .thenReturn(Optional.of(storedFile));
        when(passwordEncoder.matches("secret123", "hashed-password"))
            .thenReturn(true);
        when(fileStorageService.loadAsResource("stored-document.pdf"))
            .thenReturn(resource);

        ResponseEntity<Resource> response = fileService.downloadFile("token-123", "secret123");

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        verify(passwordEncoder).matches("secret123", "hashed-password");
    }

    @Test
    void downloadFile_shouldThrowInvalidFilePasswordException_whenPasswordIsMissing() {
        StoredFile storedFile = buildStoredFile(true);

        when(storedFileRepository.findByDownloadToken("token-123"))
            .thenReturn(Optional.of(storedFile));

        InvalidFilePasswordException exception = assertThrows(
            InvalidFilePasswordException.class,
            () -> fileService.downloadFile("token-123", null)
        );

        assertEquals("Le mot de passe est requis pour télécharger ce fichier.", exception.getMessage());
        verify(fileStorageService, never()).loadAsResource(anyString());
    }

    @Test
    void downloadFile_shouldThrowInvalidFilePasswordException_whenPasswordIsBlank() {
        StoredFile storedFile = buildStoredFile(true);

        when(storedFileRepository.findByDownloadToken("token-123"))
            .thenReturn(Optional.of(storedFile));

        InvalidFilePasswordException exception = assertThrows(
            InvalidFilePasswordException.class,
            () -> fileService.downloadFile("token-123", "   ")
        );

        assertEquals("Le mot de passe est requis pour télécharger ce fichier.", exception.getMessage());
        verify(fileStorageService, never()).loadAsResource(anyString());
    }

    @Test
    void downloadFile_shouldThrowInvalidFilePasswordException_whenPasswordIsIncorrect() {
        StoredFile storedFile = buildStoredFile(true);

        when(storedFileRepository.findByDownloadToken("token-123"))
            .thenReturn(Optional.of(storedFile));
        when(passwordEncoder.matches("wrong-password", "hashed-password"))
            .thenReturn(false);

        InvalidFilePasswordException exception = assertThrows(
            InvalidFilePasswordException.class,
            () -> fileService.downloadFile("token-123", "wrong-password")
        );

        assertEquals("Mot de passe invalide.", exception.getMessage());
        verify(fileStorageService, never()).loadAsResource(anyString());
    }

    private StoredFile buildStoredFile(boolean passwordProtected) {
        StoredFile storedFile = new StoredFile();
        storedFile.setOriginalFilename("document.pdf");
        storedFile.setStoredFilename("stored-document.pdf");
        storedFile.setMimeType("application/pdf");
        storedFile.setSize(1234L);
        storedFile.setDownloadToken("token-123");
        storedFile.setCreatedAt(LocalDateTime.now().minusHours(1));
        storedFile.setExpiresAt(LocalDateTime.now().plusDays(1));

        if (passwordProtected) {
            storedFile.setPasswordHash("hashed-password");
        }

        return storedFile;
    }
}