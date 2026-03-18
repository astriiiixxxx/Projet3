package com.datashare.backend.service;

import com.datashare.backend.entity.User;
import com.datashare.backend.config.FileStorageProperties;
import com.datashare.backend.dto.UploadFileResponse;
import com.datashare.backend.entity.StoredFile;
import com.datashare.backend.repository.StoredFileRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class FileService {

    private static final Set<String> FORBIDDEN_EXTENSIONS = Set.of(
            ".exe", ".bat", ".cmd", ".sh", ".msi", ".js"
    );

    private final StoredFileRepository storedFileRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageProperties properties;

    @Value("${app.public-base-url:http://localhost:3000}")
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

        StoredFile storedFile = new StoredFile();
        storedFile.setOriginalFilename(file.getOriginalFilename());
        storedFile.setStoredFilename(storedFilename);
        storedFile.setMimeType(file.getContentType());
        storedFile.setSize(file.getSize());
        storedFile.setDownloadToken(UUID.randomUUID().toString());
        storedFile.setCreatedAt(LocalDateTime.now());
        storedFile.setExpiresAt(LocalDateTime.now().plusDays(effectiveExpirationDays));
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

    public List<StoredFile> getMyFiles(User owner) {
        return storedFileRepository.findByOwnerOrderByCreatedAtDesc(owner);
    }

    public void deleteMyFile(Long fileId, User owner) {
        StoredFile file = storedFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Fichier introuvable."));

        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Accès interdit à ce fichier.");
        }

        fileStorageService.delete(file.getStoredFilename());
        storedFileRepository.delete(file);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Le fichier est obligatoire.");
        }

        if (file.getSize() > properties.getMaxSizeBytes()) {
            throw new RuntimeException("Le fichier dépasse la taille maximale autorisée.");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename).toLowerCase();

        if (FORBIDDEN_EXTENSIONS.contains(extension)) {
            throw new RuntimeException("Ce type de fichier est interdit.");
        }
    }

    private void validatePassword(String password) {
        if (password != null && !password.isBlank() && password.length() < 6) {
            throw new RuntimeException("Le mot de passe doit contenir au moins 6 caractères.");
        }
    }

    private int resolveExpirationDays(Integer expirationDays) {
        if (expirationDays == null) {
            return properties.getDefaultExpirationDays();
        }

        if (expirationDays < 1 || expirationDays > properties.getMaxExpirationDays()) {
            throw new RuntimeException("La durée d'expiration doit être comprise entre 1 et 7 jours.");
        }

        return expirationDays;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.'));
    }
}