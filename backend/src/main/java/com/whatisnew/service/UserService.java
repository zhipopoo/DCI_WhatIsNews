package com.whatisnew.service;

import com.whatisnew.dto.AdminUserDTO;
import com.whatisnew.dto.ChangePasswordRequest;
import com.whatisnew.dto.CreateUserRequest;
import com.whatisnew.dto.PageResult;
import org.springframework.data.domain.Pageable;

public interface UserService {
    PageResult<AdminUserDTO> listUsers(Pageable pageable);
    AdminUserDTO getUserById(Long id);
    AdminUserDTO createUser(CreateUserRequest request);
    AdminUserDTO updateUser(Long id, CreateUserRequest request);
    void deleteUser(Long id);
    void changeMyPassword(String username, ChangePasswordRequest request);
}
