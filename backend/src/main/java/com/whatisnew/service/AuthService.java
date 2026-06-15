package com.whatisnew.service;

import com.whatisnew.dto.LoginRequest;
import com.whatisnew.dto.LoginResponse;

public interface AuthService {

    /** Authenticate admin user and return JWT token */
    LoginResponse login(LoginRequest request);

    /** Initialize default admin account if not exists */
    void initDefaultAdmin();
}
