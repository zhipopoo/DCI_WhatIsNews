package com.whatisnew.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteSettingsDTO {

    private String logoUrl;
    private String primaryColor;
}
