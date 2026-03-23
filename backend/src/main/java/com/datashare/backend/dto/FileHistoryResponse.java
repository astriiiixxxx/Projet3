package com.datashare.backend.dto;

import java.time.LocalDateTime;

public class FileHistoryResponse {

    private Long id;
    private String originalFilename;
    private long size;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean expired;
    private boolean passwordProtected;
    private String downloadToken;
    private String downloadUrl;

    public FileHistoryResponse(
        Long id,
        String originalFilename,
        long size,
        LocalDateTime createdAt,
        LocalDateTime expiresAt,
        boolean expired,
        boolean passwordProtected,
        String downloadToken,
        String downloadUrl
    ) {
        this.id = id;
        this.originalFilename = originalFilename;
        this.size = size;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.expired = expired;
        this.passwordProtected = passwordProtected;
        this.downloadToken = downloadToken;
        this.downloadUrl = downloadUrl;
    }

    public Long getId() {
        return id;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public long getSize() {
        return size;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public boolean isExpired() {
        return expired;
    }

    public boolean isPasswordProtected() {
        return passwordProtected;
    }

    public String getDownloadToken() {
        return downloadToken;
    }

    public String getDownloadUrl() {
        return downloadUrl;
    }
}