package com.datashare.backend.service;

import com.datashare.backend.config.FileStorageProperties;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadPath;

    public FileStorageService(FileStorageProperties properties) throws IOException {
        this.uploadPath = Paths.get(properties.getUploadDir()).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadPath);
    }

    public String store(MultipartFile file) {
        try {
            String extension = getExtension(file.getOriginalFilename());
            String storedFilename = UUID.randomUUID() + extension;

            Path targetLocation = uploadPath.resolve(storedFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return storedFilename;
        } catch (IOException e) {
            throw new RuntimeException("Impossible de stocker le fichier.", e);
        }
    }

    public Path resolve(String storedFilename) {
        return uploadPath.resolve(storedFilename).normalize();
    }

    public void delete(String storedFilename) {
        try {
            Files.deleteIfExists(resolve(storedFilename));
        } catch (IOException e) {
            throw new RuntimeException("Impossible de supprimer le fichier physique.", e);
        }
    }

    private String getExtension(String filename) {
        String clean = StringUtils.cleanPath(filename == null ? "" : filename);
        int index = clean.lastIndexOf('.');
        return index >= 0 ? clean.substring(index) : "";
    }
}