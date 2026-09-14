package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.response.DashboardStatsResponse;
import com.resumeanalyzer.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * DashboardController
 *
 * Routes (under /api prefix):
 *  GET /dashboard/stats  → user's personal dashboard statistics
 */
@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                dashboardService.getUserStats(userDetails.getUsername()));
    }
}
