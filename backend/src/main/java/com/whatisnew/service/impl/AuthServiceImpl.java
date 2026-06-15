package com.whatisnew.service.impl;

import com.whatisnew.dto.LoginRequest;
import com.whatisnew.dto.LoginResponse;
import com.whatisnew.entity.AdminUser;
import com.whatisnew.repository.AdminUserRepository;
import com.whatisnew.security.JwtTokenProvider;
import com.whatisnew.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.default-username:admin}")
    private String defaultUsername;

    @Value("${admin.default-password:admin123}")
    private String defaultPassword;

    @Override
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String token = jwtTokenProvider.generateToken(authentication.getName());

        // Update last login time
        AdminUser adminUser = adminUserRepository.findByUsername(request.getUsername()).orElse(null);
        if (adminUser != null) {
            adminUser.setLastLoginAt(LocalDateTime.now());
            adminUserRepository.save(adminUser);
        }

        String displayName = adminUser != null && adminUser.getDisplayName() != null
                ? adminUser.getDisplayName()
                : request.getUsername();

        return LoginResponse.of(token, request.getUsername(), displayName);
    }

    @Override
    public void initDefaultAdmin() {
        if (!adminUserRepository.existsByUsername(defaultUsername)) {
            AdminUser admin = AdminUser.builder()
                    .username(defaultUsername)
                    .password(passwordEncoder.encode(defaultPassword))
                    .displayName("Super Admin")
                    .isActive(true)
                    .build();
            adminUserRepository.save(admin);
            log.info("Initialized default admin account: username={}", defaultUsername);
        } else {
            log.info("Admin account already exists, skipping initialization");
        }
    }
}
