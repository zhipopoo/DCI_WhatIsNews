package com.whatisnew.controller;

import com.whatisnew.common.Result;
import com.whatisnew.dto.LoginRequest;
import com.whatisnew.dto.LoginResponse;
import com.whatisnew.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return Result.success("Login successful", response);
    }
}
