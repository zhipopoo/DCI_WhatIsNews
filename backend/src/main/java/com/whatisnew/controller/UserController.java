package com.whatisnew.controller;

import com.whatisnew.common.Result;
import com.whatisnew.dto.AdminUserDTO;
import com.whatisnew.dto.ChangePasswordRequest;
import com.whatisnew.dto.CreateUserRequest;
import com.whatisnew.dto.PageResult;
import com.whatisnew.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public Result<PageResult<AdminUserDTO>> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return Result.success(userService.listUsers(pageable));
    }

    @GetMapping("/{id}")
    public Result<AdminUserDTO> getUser(@PathVariable Long id) {
        return Result.success(userService.getUserById(id));
    }

    @PostMapping
    public Result<AdminUserDTO> createUser(@RequestBody CreateUserRequest request) {
        return Result.success("User created", userService.createUser(request));
    }

    @PutMapping("/{id}")
    public Result<AdminUserDTO> updateUser(@PathVariable Long id, @RequestBody CreateUserRequest request) {
        return Result.success("User updated", userService.updateUser(id, request));
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return Result.ok("User deleted");
    }

    @PutMapping("/me/password")
    public Result<Void> changePassword(@RequestBody ChangePasswordRequest request, Authentication auth) {
        userService.changeMyPassword(auth.getName(), request);
        return Result.ok("Password changed");
    }
}
