package com.whatisnews.security;

import com.whatisnews.entity.AdminUser;
import com.whatisnews.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Loads admin user details for Spring Security authentication.
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final AdminUserRepository adminUserRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AdminUser adminUser = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        if (!adminUser.getIsActive()) {
            throw new UsernameNotFoundException("User is disabled: " + username);
        }

        return new User(
                adminUser.getUsername(),
                adminUser.getPassword(),
                true, true, true, true,
                Collections.singleton(() -> "ROLE_ADMIN")
        );
    }
}
