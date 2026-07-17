package com.whatisnew.controller;

import com.whatisnew.common.Result;
import com.whatisnew.dto.UsefulLinkDTO;
import com.whatisnew.service.UsefulLinkService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class UsefulLinkController {

    private final UsefulLinkService usefulLinkService;

    // Public: get active useful links
    @GetMapping("/api/useful-links")
    public Result<List<UsefulLinkDTO>> getActiveLinks() {
        return Result.success(usefulLinkService.getActiveLinks());
    }

    // Admin: list all useful links
    @GetMapping("/api/admin/useful-links")
    public Result<List<UsefulLinkDTO>> listAllLinks() {
        return Result.success(usefulLinkService.listAllLinks());
    }

    // Admin: create useful link
    @PostMapping("/api/admin/useful-links")
    public Result<UsefulLinkDTO> createLink(@RequestBody UsefulLinkDTO dto) {
        return Result.success(usefulLinkService.createLink(dto));
    }

    // Admin: update useful link
    @PutMapping("/api/admin/useful-links/{id}")
    public Result<UsefulLinkDTO> updateLink(@PathVariable Long id, @RequestBody UsefulLinkDTO dto) {
        return Result.success(usefulLinkService.updateLink(id, dto));
    }

    // Admin: delete useful link
    @DeleteMapping("/api/admin/useful-links/{id}")
    public Result<Void> deleteLink(@PathVariable Long id) {
        usefulLinkService.deleteLink(id);
        return Result.ok("Useful link deleted");
    }
}
