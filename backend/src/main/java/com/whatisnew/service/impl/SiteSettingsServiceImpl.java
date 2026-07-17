package com.whatisnew.service.impl;

import com.whatisnew.dto.SiteSettingsDTO;
import com.whatisnew.entity.SiteSettings;
import com.whatisnew.repository.SiteSettingsRepository;
import com.whatisnew.service.SiteSettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class SiteSettingsServiceImpl implements SiteSettingsService {

    private static final long SETTINGS_ID = 1L;
    private static final String DEFAULT_COLOR = "#C7000B";

    private final SiteSettingsRepository siteSettingsRepository;

    @Override
    @Transactional(readOnly = true)
    public SiteSettingsDTO getSettings() {
        Optional<SiteSettings> opt = siteSettingsRepository.findById(SETTINGS_ID);
        if (opt.isPresent()) {
            SiteSettings s = opt.get();
            return SiteSettingsDTO.builder()
                    .logoUrl(s.getLogoUrl())
                    .primaryColor(s.getPrimaryColor() != null ? s.getPrimaryColor() : DEFAULT_COLOR)
                    .build();
        }
        return SiteSettingsDTO.builder()
                .logoUrl(null)
                .primaryColor(DEFAULT_COLOR)
                .build();
    }

    @Override
    public SiteSettingsDTO updateSettings(SiteSettingsDTO dto) {
        SiteSettings settings = siteSettingsRepository.findById(SETTINGS_ID)
                .orElseGet(() -> SiteSettings.builder()
                        .id(SETTINGS_ID)
                        .primaryColor(DEFAULT_COLOR)
                        .build());

        if (dto.getLogoUrl() != null) {
            settings.setLogoUrl(dto.getLogoUrl().isEmpty() ? null : dto.getLogoUrl());
        }
        if (dto.getPrimaryColor() != null && !dto.getPrimaryColor().isBlank()) {
            settings.setPrimaryColor(dto.getPrimaryColor());
        }

        settings = siteSettingsRepository.save(settings);
        log.info("Updated site settings: logoUrl={}, primaryColor={}",
                settings.getLogoUrl(), settings.getPrimaryColor());

        return SiteSettingsDTO.builder()
                .logoUrl(settings.getLogoUrl())
                .primaryColor(settings.getPrimaryColor())
                .build();
    }
}
