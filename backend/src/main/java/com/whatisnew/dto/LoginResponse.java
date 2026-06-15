package com.whatisnew.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String tokenType;
    private String username;
    private String displayName;

    public static LoginResponse of(String token, String username, String displayName) {
        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .username(username)
                .displayName(displayName)
                .build();
    }
}
