package com.datashare.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.file")
public class FileStorageProperties {

    private String uploadDir;
    private long maxSizeBytes;
    private int defaultExpirationDays;
    private int maxExpirationDays;

    public String getUploadDir() {
        return uploadDir;
    }

    public void setUploadDir(String uploadDir) {
        this.uploadDir = uploadDir;
    }

    public long getMaxSizeBytes() {
        return maxSizeBytes;
    }

    public void setMaxSizeBytes(long maxSizeBytes) {
        this.maxSizeBytes = maxSizeBytes;
    }

    public int getDefaultExpirationDays() {
        return defaultExpirationDays;
    }

    public void setDefaultExpirationDays(int defaultExpirationDays) {
        this.defaultExpirationDays = defaultExpirationDays;
    }

    public int getMaxExpirationDays() {
        return maxExpirationDays;
    }

    public void setMaxExpirationDays(int maxExpirationDays) {
        this.maxExpirationDays = maxExpirationDays;
    }
}