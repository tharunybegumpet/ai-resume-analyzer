package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.response.DashboardStatsResponse;

public interface DashboardService {
    DashboardStatsResponse getUserStats(String userEmail);
}
