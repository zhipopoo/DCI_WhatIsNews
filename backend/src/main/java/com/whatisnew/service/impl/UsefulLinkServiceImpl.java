package com.whatisnew.service.impl;

import com.whatisnew.dto.UsefulLinkDTO;
import com.whatisnew.entity.UsefulLink;
import com.whatisnew.repository.UsefulLinkRepository;
import com.whatisnew.service.UsefulLinkService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UsefulLinkServiceImpl implements UsefulLinkService {

    private final UsefulLinkRepository usefulLinkRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UsefulLinkDTO> getActiveLinks() {
        return usefulLinkRepository.findByIsActiveTrueOrderBySortOrderAsc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsefulLinkDTO> listAllLinks() {
        return usefulLinkRepository.findAllByOrderBySortOrderAsc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UsefulLinkDTO createLink(UsefulLinkDTO dto) {
        UsefulLink link = UsefulLink.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .mediaFileId(dto.getMediaFileId())
                .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
        link = usefulLinkRepository.save(link);
        log.info("Created useful link: id={}, title={}", link.getId(), link.getTitle());
        return toDTO(link);
    }

    @Override
    public UsefulLinkDTO updateLink(Long id, UsefulLinkDTO dto) {
        UsefulLink link = usefulLinkRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Useful link not found: " + id));

        if (dto.getTitle() != null) link.setTitle(dto.getTitle());
        if (dto.getDescription() != null) link.setDescription(dto.getDescription());
        if (dto.getMediaFileId() != null) link.setMediaFileId(dto.getMediaFileId());
        if (dto.getSortOrder() != null) link.setSortOrder(dto.getSortOrder());
        if (dto.getIsActive() != null) link.setIsActive(dto.getIsActive());

        link = usefulLinkRepository.save(link);
        log.info("Updated useful link: id={}, title={}", link.getId(), link.getTitle());
        return toDTO(link);
    }

    @Override
    public void deleteLink(Long id) {
        UsefulLink link = usefulLinkRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Useful link not found: " + id));
        usefulLinkRepository.delete(link);
        log.info("Deleted useful link: id={}, title={}", id, link.getTitle());
    }

    private UsefulLinkDTO toDTO(UsefulLink link) {
        return UsefulLinkDTO.builder()
                .id(link.getId())
                .title(link.getTitle())
                .description(link.getDescription())
                .mediaFileId(link.getMediaFileId())
                .filePath(link.getMediaFile() != null ? link.getMediaFile().getFilePath() : null)
                .fileName(link.getMediaFile() != null ? link.getMediaFile().getOriginalName() : null)
                .fileSize(link.getMediaFile() != null ? link.getMediaFile().getFileSize() : null)
                .sortOrder(link.getSortOrder())
                .isActive(link.getIsActive())
                .createdAt(link.getCreatedAt())
                .updatedAt(link.getUpdatedAt())
                .build();
    }
}
