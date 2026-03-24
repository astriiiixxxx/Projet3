package com.datashare.backend.controller;

import com.datashare.backend.dto.FileHistoryResponse;
import com.datashare.backend.dto.PublicFileResponse;
import com.datashare.backend.dto.UploadFileResponse;
import com.datashare.backend.entity.User;
import com.datashare.backend.repository.UserRepository;
import com.datashare.backend.service.FileService;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;
    private final UserRepository userRepository;

    public FileController(FileService fileService, UserRepository userRepository) {
        this.fileService = fileService;
        this.userRepository = userRepository;
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<UploadFileResponse> uploadFile(
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "expirationDays", required = false) Integer expirationDays,
        @RequestParam(value = "password", required = false) String password,
        Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        UploadFileResponse response = fileService.upload(file, expirationDays, password, currentUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/anonymous", consumes = "multipart/form-data")
    public ResponseEntity<UploadFileResponse> uploadAnonymousFile(
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "expirationDays", required = false) Integer expirationDays,
        @RequestParam(value = "password", required = false) String password
    ) {
        UploadFileResponse response = fileService.upload(file, expirationDays, password, null);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<FileHistoryResponse>> getMyFiles(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        return ResponseEntity.ok(fileService.getMyFiles(currentUser));
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> deleteMyFile(
        @PathVariable Long fileId,
        Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        fileService.deleteMyFile(fileId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/public/{token}")
    public ResponseEntity<PublicFileResponse> getPublicFile(@PathVariable String token) {
        return ResponseEntity.ok(fileService.getPublicFile(token));
    }

    @GetMapping("/download/{token}")
    public ResponseEntity<Resource> downloadFile(
        @PathVariable String token,
        @RequestHeader(value = "X-File-Password", required = false) String password
    ) {
        return fileService.downloadFile(token, password);
    }

    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();

        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Utilisateur introuvable."));
    }
}