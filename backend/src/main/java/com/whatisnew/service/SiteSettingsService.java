package com.whatisnew.service;

import com.whatisnew.dto.SiteSettingsDTO;

public interface SiteSettingsService {

    SiteSettingsDTO getSettings();

    SiteSettingsDTO updateSettings(SiteSettingsDTO dto);
}
