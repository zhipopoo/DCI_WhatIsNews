package com.whatisnew.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * Web MVC configuration — CORS and static resource mapping for uploads.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    /**
     * Comma-separated list of allowed CORS origin patterns for /api/**.
     * Uses {@code allowedOriginPatterns} (supports wildcards like {@code *})
     * which IS compatible with {@code allowCredentials(true)},
     * unlike {@code allowedOrigins("*")}.
     *
     * <p>Default: {@code *} — allows all origins. Override via the
     * {@code CORS_ALLOWED_ORIGIN_PATTERNS} env var in production to
     * lock down to specific domains.</p>
     */
    @Value("${cors.allowed-origin-patterns:*}")
    private List<String> apiAllowedOriginPatterns;

    /**
     * {@link CorsConfigurationSource} bean picked up by Spring Security's
     * {@code http.cors()} — handles OPTIONS preflight BEFORE auth filters.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(apiAllowedOriginPatterns);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/uploads/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "HEAD", "OPTIONS")
                .maxAge(3600);
        registry.addMapping("/api/**")
                .allowedOriginPatterns(apiAllowedOriginPatterns.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }
}
