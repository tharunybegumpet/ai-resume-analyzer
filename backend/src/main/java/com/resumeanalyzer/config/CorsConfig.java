package com.resumeanalyzer.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Value("${app.allowed.origins:http://localhost:5173}")
    private String allowedOrigins;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                var mapping = registry.addMapping("/**")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                        .allowedHeaders("*")
                        .exposedHeaders("Authorization")
                        .maxAge(3600);

                // If wildcard, allow all origins (no credentials)
                if ("*".equals(allowedOrigins.trim())) {
                    mapping.allowedOriginPatterns("*");
                } else {
                    String[] origins = allowedOrigins.split(",");
                    mapping.allowedOrigins(origins).allowCredentials(true);
                }
            }
        };
    }
}
