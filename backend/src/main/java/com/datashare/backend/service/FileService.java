package com.datashare.backend.service;

import com.datashare.backend.config.FileStorageProperties;
import com.datashare.backend.dto.FileHistoryResponse;
import com.datashare.backend.dto.PublicFileResponse;
import com.datashare.backend.dto.UploadFileResponse;
import com.datashare.backend.entity.StoredFile;
import com.datashare.backend.entity.User;
import com.datashare.backend.exception.FileExpiredException;
import com.datashare.backend.exception.FileNotFoundException;
import com.datashare.backend.exception.InvalidFilePasswordException;
import com.datashare.backend.repository.StoredFileRepository;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileService {

    private static final Set<String> FORBIDDEN_EXTENSIONS = Set.of(
        ".exe", ".bat", ".cmd", ".sh", ".msi", ".js"
    );

    private final StoredFileRepository storedFileRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageProperties properties;

    @Value("${app.public-base-url:http://localhost:5173}")
    private String publicBaseUrl;

    public FileService(
        StoredFileRepository storedFileRepository,
        FileStorageService fileStorageService,
        PasswordEncoder passwordEncoder,
        FileStorageProperties properties
    ) {
        this.storedFileRepository = storedFileRepository;
        this.fileStorageService = fileStorageService;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    public UploadFileResponse upload(MultipartFile file, Integer expirationDays, String password, User owner) {
        validateFile(file);
        validatePassword(password);

        int effectiveExpirationDays = resolveExpirationDays(expirationDays);
        String storedFilename = fileStorageService.store(file);
        LocalDateTime now = LocalDateTime.now();

        StoredFile storedFile = new StoredFile();
        storedFile.setOriginalFilename(file.getOriginalFilename());
        storedFile.setStoredFilename(storedFilename);
        storedFile.setMimeType(file.getContentType());
        storedFile.setSize(file.getSize());
        storedFile.setDownloadToken(UUID.randomUUID().toString());
        storedFile.setCreatedAt(now);
        storedFile.setExpiresAt(now.plusDays(effectiveExpirationDays));
        storedFile.setOwner(owner);

        if (password != null && !password.isBlank()) {
            storedFile.setPasswordHash(passwordEncoder.encode(password));
        }

        StoredFile saved = storedFileRepository.save(storedFile);

        String downloadUrl = publicBaseUrl + "/download/" + saved.getDownloadToken();

        return new UploadFileResponse(
            saved.getId(),
            saved.getOriginalFilename(),
            saved.getDownloadToken(),
            downloadUrl,
            saved.getCreatedAt(),
            saved.getExpiresAt(),
            saved.isProtected()
        );
    }

    public List<FileHistoryResponse> getMyFiles(User owner) {
        return storedFileRepository.findByOwnerOrderByCreatedAtDesc(owner)
            .stream()
            .map(this::toFileHistoryResponse)
            .toList();
    }

    public void deleteMyFile(Long fileId, User owner) {
        StoredFile file = storedFileRepository.findById(fileId)
            .orElseThrow(() -> new FileNotFoundException("Fichier introuvable."));

        if (file.getOwner() == null || !file.getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedException("Accès interdit à ce fichier.");
        }

        fileStorageService.delete(file.getStoredFilename());
        storedFileRepository.delete(file);
    }

    public PublicFileResponse getPublicFile(String token) {
        StoredFile file = storedFileRepository.findByDownloadToken(token)
            .orElseThrow(() -> new FileNotFoundException("Lien de téléchargement invalide."));

        boolean expired = isExpired(file);

        return new PublicFileResponse(
            file.getOriginalFilename(),
            file.getMimeType(),
            file.getSize(),
            file.getCreatedAt(),
            file.getExpiresAt(),
            expired,
            file.isProtected(),
            publicBaseUrl + "/download/" + file.getDownloadToken()
        );
    }

    public ResponseEntity<Resource> downloadFile(String token, String password) {
        StoredFile file = storedFileRepository.findByDownloadToken(token)
            .orElseThrow(() -> new FileNotFoundException("Lien de téléchargement invalide."));

        if (isExpired(file)) {
            throw new FileExpiredException("Le lien de téléchargement a expiré.");
        }

        if (file.isProtected()) {
            if (password == null || password.isBlank()) {
                throw new InvalidFilePasswordException("Mot de passe requis.");
            }

            if (!passwordEncoder.matches(password, file.getPasswordHash())) {
                throw new InvalidFilePasswordException("Mot de passe invalide.");
            }
        }

        Resource resource = fileStorageService.loadAsResource(file.getStoredFilename());

        MediaType mediaType = resolveMediaType(file.getMimeType());

        String contentDisposition = ContentDisposition.attachment()
            .filename(file.getOriginalFilename(), StandardCharsets.UTF_8)
            .build()
            .toString();

        return ResponseEntity.ok()
            .contentType(mediaType)
            .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
            .body(resource);
    }

    private FileHistoryResponse toFileHistoryResponse(StoredFile file) {
        return new FileHistoryResponse(
            file.getId(),
            file.getOriginalFilename(),
            file.getSize(),
            file.getCreatedAt(),
            file.getExpiresAt(),
            isExpired(file),
            file.isProtected(),
            file.getDownloadToken(),
            publicBaseUrl + "/download/" + file.getDownloadToken()
        );
    }

    private boolean isExpired(StoredFile file) {
        return file.getExpiresAt() != null && file.getExpiresAt().isBefore(LocalDateTime.now());
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier est obligatoire.");
        }

        if (file.getSize() > properties.getMaxSizeBytes()) {
            throw new IllegalArgumentException("Le fichier dépasse la taille maximale autorisée.");
        }

        String filename = file.getOriginalFilename();
        String lowercaseName = filename == null ? "" : filename.toLowerCase();

        boolean forbidden = FORBIDDEN_EXTENSIONS.stream().anyMatch(lowercaseName::endsWith);
        if (forbidden) {
            throw new IllegalArgumentException("Ce type de fichier est interdit.");
        }
    }

    private void validatePassword(String password) {
        if (password != null && !password.isBlank() && password.trim().length() < 6) {
            throw new IllegalArgumentException("Le mot de passe doit contenir au moins 6 caractères.");
        }
    }

    private int resolveExpirationDays(Integer expirationDays) {
        if (expirationDays == null) {
            return properties.getDefaultExpirationDays();
        }

        if (expirationDays < 1 || expirationDays > properties.getMaxExpirationDays()) {
            throw new IllegalArgumentException("La durée d'expiration doit être comprise entre 1 et 7 jours.");
        }

        return expirationDays;
    }

    private MediaType resolveMediaType(String mimeType) {
        if (mimeType == null || mimeType.isBlank()) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }

        try {
            return MediaType.parseMediaType(mimeType);
        } catch (Exception e) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }
}