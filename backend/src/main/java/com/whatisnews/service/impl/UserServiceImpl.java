package com.whatisnews.service.impl;

import com.whatisnews.dto.AdminUserDTO;
import com.whatisnews.dto.ChangePasswordRequest;
import com.whatisnews.dto.CreateUserRequest;
import com.whatisnews.dto.PageResult;
import com.whatisnews.entity.AdminUser;
import com.whatisnews.repository.AdminUserRepository;
import com.whatisnews.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public PageResult<AdminUserDTO> listUsers(Pageable pageable) {
        Page<AdminUser> page = adminUserRepository.findAll(pageable);
        return PageResult.<AdminUserDTO>builder()
                .content(page.getContent().stream().map(this::toDTO).collect(Collectors.toList()))
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserDTO getUserById(Long id) {
        AdminUser user = adminUserRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
        return toDTO(user);
    }

    @Override
    public AdminUserDTO createUser(CreateUserRequest request) {
        if (adminUserRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + request.getUsername());
        }
        AdminUser user = AdminUser.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName() != null ? request.getDisplayName() : request.getUsername())
                .email(request.getEmail())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        user = adminUserRepository.save(user);
        log.info("Created user: id={}, username={}", user.getId(), user.getUsername());
        return toDTO(user);
    }

    @Override
    public AdminUserDTO updateUser(Long id, CreateUserRequest request) {
        AdminUser user = adminUserRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));

        if (!user.getUsername().equals(request.getUsername()) &&
                adminUserRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + request.getUsername());
        }

        user.setUsername(request.getUsername());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        user.setDisplayName(request.getDisplayName());
        user.setEmail(request.getEmail());
        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }
        user = adminUserRepository.save(user);
        log.info("Updated user: id={}, username={}", user.getId(), user.getUsername());
        return toDTO(user);
    }

    @Override
    public void deleteUser(Long id) {
        AdminUser user = adminUserRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
        if ("admin".equals(user.getUsername())) {
            throw new IllegalArgumentException("Cannot delete the default admin user");
        }
        adminUserRepository.delete(user);
        log.info("Deleted user: id={}, username={}", id, user.getUsername());
    }

    @Override
    public void changeMyPassword(String username, ChangePasswordRequest request) {
        AdminUser user = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + username));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        adminUserRepository.save(user);
        log.info("Password changed for user: {}", username);
    }

    private AdminUserDTO toDTO(AdminUser user) {
        return AdminUserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .email(user.getEmail())
                .isActive(user.getIsActive())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
