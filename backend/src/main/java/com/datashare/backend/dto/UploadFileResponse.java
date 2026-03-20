package com.datashare.backend.dto;

import java.time.LocalDateTime;

public class UploadFileResponse {

    private Long id;
    private String originalFilename;
    private String downloadToken;
    private String downloadUrl;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean passwordProtected;

    public UploadFileResponse(
            Long id,
            String originalFilename,
            String downloadToken,
            String downloadUrl,
            LocalDateTime createdAt,
            LocalDateTime expiresAt,
            boolean passwordProtected
    ) {
        this.id = id;
        this.originalFilename = originalFilename;
        this.downloadToken = downloadToken;
        this.downloadUrl = downloadUrl;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.passwordProtected = passwordProtected;
    }

    public Long getId() {
        return id;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public String getDownloadToken() {
        return downloadToken;
    }

    public String getDownloadUrl() {
        return downloadUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public boolean isPasswordProtected() {
        return passwordProtected;
    }
}