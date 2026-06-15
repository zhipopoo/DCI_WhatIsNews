package com.whatisnew.dto;

import lombok.Data;

@Data
public class CreateUserRequest {
    private String username;
    private String password;
    private String displayName;
    private String email;
    private Boolean isActive;
}
