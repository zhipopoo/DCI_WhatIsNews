package com.whatisnew.controller;

import com.whatisnew.common.Result;
import com.whatisnew.dto.SiteSettingsDTO;
import com.whatisnew.service.SiteSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class SiteSettingsController {

    private final SiteSettingsService siteSettingsService;

    @GetMapping("/api/settings")
    public Result<SiteSettingsDTO> getSettings() {
        return Result.success(siteSettingsService.getSettings());
    }

    @PutMapping("/api/admin/settings")
    public Result<SiteSettingsDTO> updateSettings(@RequestBody SiteSettingsDTO dto) {
        return Result.success("Settings updated", siteSettingsService.updateSettings(dto));
    }
}
