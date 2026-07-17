package com.whatisnew.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsefulLinkDTO {

    private Long id;
    private String title;
    private String description;
    private Long mediaFileId;
    private String filePath;
    private String fileName;
    private Long fileSize;
    private Integer sortOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
