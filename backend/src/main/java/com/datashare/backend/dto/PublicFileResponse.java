package com.datashare.backend.dto;

import java.time.LocalDateTime;

public class PublicFileResponse {

    private String originalFilename;
    private String mimeType;
    private Long size;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean expired;
    private boolean passwordProtected;
    private String downloadUrl;

    public PublicFileResponse() {
    }

    public PublicFileResponse(
        String originalFilename,
        String mimeType,
        Long size,
        LocalDateTime createdAt,
        LocalDateTime expiresAt,
        boolean expired,
        boolean passwordProtected,
        String downloadUrl
    ) {
        this.originalFilename = originalFilename;
        this.mimeType = mimeType;
        this.size = size;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.expired = expired;
        this.passwordProtected = passwordProtected;
        this.downloadUrl = downloadUrl;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public boolean isExpired() {
        return expired;
    }

    public void setExpired(boolean expired) {
        this.expired = expired;
    }

    public boolean isPasswordProtected() {
        return passwordProtected;
    }

    public void setPasswordProtected(boolean passwordProtected) {
        this.passwordProtected = passwordProtected;
    }

    public String getDownloadUrl() {
        return downloadUrl;
    }

    public void setDownloadUrl(String downloadUrl) {
        this.downloadUrl = downloadUrl;
    }
}