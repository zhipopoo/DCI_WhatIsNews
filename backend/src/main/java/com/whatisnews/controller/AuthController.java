package com.whatisnews.controller;

import com.whatisnews.common.Result;
import com.whatisnews.dto.LoginRequest;
import com.whatisnews.dto.LoginResponse;
import com.whatisnews.service.AuthService;
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
