package com.datashare.backend.repository;

import com.datashare.backend.entity.User;
import com.datashare.backend.entity.StoredFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface StoredFileRepository extends JpaRepository<StoredFile, Long> {

    List<StoredFile> findByOwnerOrderByCreatedAtDesc(User owner);

    Optional<StoredFile> findByDownloadToken(String downloadToken);

    List<StoredFile> findByExpiresAtBefore(LocalDateTime dateTime);
}