package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.response.AdminStatsResponse;
import com.resumeanalyzer.dto.response.UserProfileResponse;
import com.resumeanalyzer.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Routes (ROLE_ADMIN only — enforced by SecurityConfig + @PreAuthorize):
 *  GET /admin/stats  → platform-wide statistics
 *  GET /admin/users  → all registered users
 */
@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserProfileResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }
}
