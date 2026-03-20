package com.datashare.backend.service;

import com.datashare.backend.config.FileStorageProperties;
import com.datashare.backend.dto.UploadFileResponse;
import com.datashare.backend.entity.StoredFile;
import com.datashare.backend.entity.User;
import com.datashare.backend.repository.StoredFileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

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
    private MultipartFile multipartFile;

    private FileStorageProperties properties;
    private FileService fileService;

    @BeforeEach
    void setUp() {
        properties = new FileStorageProperties();
        properties.setUploadDir("uploads");
        properties.setMaxSizeBytes(10_000_000L);
        properties.setDefaultExpirationDays(7);
        properties.setMaxExpirationDays(7);

        fileService = new FileService(
                storedFileRepository,
                fileStorageService,
                passwordEncoder,
                properties
        );

        ReflectionTestUtils.setField(fileService, "publicBaseUrl", "http://localhost:3000");
    }

    @Test
    void shouldUploadFileSuccessfully() {
        User owner = new User();
        owner.setId(1L);

        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(1234L);
        when(multipartFile.getOriginalFilename()).thenReturn("test.pdf");
        when(multipartFile.getContentType()).thenReturn("application/pdf");
        when(fileStorageService.store(multipartFile)).thenReturn("uuid-test.pdf");

        when(storedFileRepository.save(any(StoredFile.class))).thenAnswer(invocation -> {
            StoredFile file = invocation.getArgument(0);
            ReflectionTestUtils.setField(file, "id", 1L);
            return file;
        });

        UploadFileResponse response = fileService.upload(multipartFile, 7, null, owner);

        assertNotNull(response);
        assertEquals("test.pdf", response.getOriginalFilename());
        assertEquals("http://localhost:3000/download/" + response.getDownloadToken(), response.getDownloadUrl());
        assertFalse(response.isPasswordProtected());

        verify(fileStorageService).store(multipartFile);
        verify(storedFileRepository).save(any(StoredFile.class));
    }

    @Test
    void shouldHashPasswordWhenProvided() {
        User owner = new User();
        owner.setId(1L);

        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(1234L);
        when(multipartFile.getOriginalFilename()).thenReturn("test.pdf");
        when(multipartFile.getContentType()).thenReturn("application/pdf");
        when(fileStorageService.store(multipartFile)).thenReturn("uuid-test.pdf");
        when(passwordEncoder.encode("secret123")).thenReturn("hashed-password");

        when(storedFileRepository.save(any(StoredFile.class))).thenAnswer(invocation -> {
            StoredFile file = invocation.getArgument(0);
            ReflectionTestUtils.setField(file, "id", 1L);
            return file;
        });

        UploadFileResponse response = fileService.upload(multipartFile, 7, "secret123", owner);

        assertTrue(response.isPasswordProtected());
        verify(passwordEncoder).encode("secret123");
    }

    @Test
    void shouldUseDefaultExpirationWhenNull() {
        User owner = new User();
        owner.setId(1L);

        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(1234L);
        when(multipartFile.getOriginalFilename()).thenReturn("test.pdf");
        when(multipartFile.getContentType()).thenReturn("application/pdf");
        when(fileStorageService.store(multipartFile)).thenReturn("uuid-test.pdf");

        when(storedFileRepository.save(any(StoredFile.class))).thenAnswer(invocation -> {
            StoredFile file = invocation.getArgument(0);
            ReflectionTestUtils.setField(file, "id", 1L);
            return file;
        });

        UploadFileResponse response = fileService.upload(multipartFile, null, null, owner);

        assertNotNull(response.getExpiresAt());
    }

    @Test
    void shouldRejectEmptyFile() {
        User owner = new User();
        owner.setId(1L);

        when(multipartFile.isEmpty()).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                fileService.upload(multipartFile, 7, null, owner)
        );

        assertEquals("Le fichier est obligatoire.", exception.getMessage());
        verify(fileStorageService, never()).store(any());
    }

    @Test
    void shouldRejectForbiddenExtension() {
        User owner = new User();
        owner.setId(1L);

        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(1234L);
        when(multipartFile.getOriginalFilename()).thenReturn("virus.exe");

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                fileService.upload(multipartFile, 7, null, owner)
        );

        assertEquals("Ce type de fichier est interdit.", exception.getMessage());
        verify(fileStorageService, never()).store(any());
    }

    @Test
void shouldRejectTooLargeFile() {
    User owner = new User();
    owner.setId(1L);

    when(multipartFile.isEmpty()).thenReturn(false);
    when(multipartFile.getSize()).thenReturn(99_999_999L);

    RuntimeException exception = assertThrows(RuntimeException.class, () ->
            fileService.upload(multipartFile, 7, null, owner)
    );

    assertEquals("Le fichier dépasse la taille maximale autorisée.", exception.getMessage());
    verify(fileStorageService, never()).store(any());
}

    @Test
    void shouldRejectShortPassword() {
        User owner = new User();
        owner.setId(1L);

        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(1234L);
        when(multipartFile.getOriginalFilename()).thenReturn("test.pdf");

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                fileService.upload(multipartFile, 7, "123", owner)
        );

        assertEquals("Le mot de passe doit contenir au moins 6 caractères.", exception.getMessage());
        verify(fileStorageService, never()).store(any());
    }

    @Test
    void shouldRejectExpirationBelowRange() {
        User owner = new User();
        owner.setId(1L);

        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(1234L);
        when(multipartFile.getOriginalFilename()).thenReturn("test.pdf");

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                fileService.upload(multipartFile, 0, null, owner)
        );

        assertEquals("La durée d'expiration doit être comprise entre 1 et 7 jours.", exception.getMessage());
    }

    @Test
    void shouldRejectExpirationAboveRange() {
        User owner = new User();
        owner.setId(1L);

        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(1234L);
        when(multipartFile.getOriginalFilename()).thenReturn("test.pdf");

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                fileService.upload(multipartFile, 8, null, owner)
        );

        assertEquals("La durée d'expiration doit être comprise entre 1 et 7 jours.", exception.getMessage());
    }
}