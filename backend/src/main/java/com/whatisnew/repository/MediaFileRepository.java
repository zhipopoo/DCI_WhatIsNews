package com.whatisnew.repository;

import com.whatisnew.entity.MediaFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MediaFileRepository extends JpaRepository<MediaFile, Long> {

    Page<MediaFile> findByFileType(String fileType, Pageable pageable);

    Page<MediaFile> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Optional<MediaFile> findByFilePath(String filePath);
}
