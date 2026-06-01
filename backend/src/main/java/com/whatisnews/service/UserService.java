package com.whatisnews.service;

import com.whatisnews.dto.AdminUserDTO;
import com.whatisnews.dto.ChangePasswordRequest;
import com.whatisnews.dto.CreateUserRequest;
import com.whatisnews.dto.PageResult;
import org.springframework.data.domain.Pageable;

public interface UserService {
    PageResult<AdminUserDTO> listUsers(Pageable pageable);
    AdminUserDTO getUserById(Long id);
    AdminUserDTO createUser(CreateUserRequest request);
    AdminUserDTO updateUser(Long id, CreateUserRequest request);
    void deleteUser(Long id);
    void changeMyPassword(String username, ChangePasswordRequest request);
}
