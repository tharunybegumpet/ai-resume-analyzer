package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.request.LoginRequest;
import com.resumeanalyzer.dto.request.RegisterRequest;
import com.resumeanalyzer.dto.request.UpdateProfileRequest;
import com.resumeanalyzer.dto.response.AuthResponse;
import com.resumeanalyzer.dto.response.UserProfileResponse;
import com.resumeanalyzer.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AuthController — handles all authentication and profile endpoints.
 *
 * Routes (all under /api prefix from application.properties):
 *  POST /auth/register     → register a new user
 *  POST /auth/login        → login and get JWT
 *  GET  /auth/profile      → get current user's profile (protected)
 *  PUT  /auth/profile      → update current user's profile (protected)
 *  POST /auth/logout       → client-side logout (stateless — just return 200)
 *
 * @AuthenticationPrincipal injects the currently authenticated UserDetails
 * from the SecurityContext (set by JwtAuthenticationFilter).
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // POST /auth/register
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // POST /auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // GET /auth/profile
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.getProfile(userDetails.getUsername()));
    }

    // PUT /auth/profile
    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(
                authService.updateProfile(userDetails.getUsername(), request));
    }

    // POST /auth/logout (stateless — token invalidation is client-side)
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully."));
    }
}
