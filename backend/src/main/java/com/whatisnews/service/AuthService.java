package com.whatisnews.service;

import com.whatisnews.dto.LoginRequest;
import com.whatisnews.dto.LoginResponse;

public interface AuthService {

    /** Authenticate admin user and return JWT token */
    LoginResponse login(LoginRequest request);

    /** Initialize default admin account if not exists */
    void initDefaultAdmin();
}
