package com.whatisnews.config;

import com.whatisnews.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Runs on application startup to initialize default data
 * (e.g., default admin account if not already present).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AuthService authService;

    @Override
    public void run(String... args) {
        log.info("Initializing default data...");
        authService.initDefaultAdmin();
        log.info("Default data initialization complete.");
    }
}
