package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.response.AdminStatsResponse;
import com.resumeanalyzer.dto.response.UserProfileResponse;
import java.util.List;

public interface AdminService {
    AdminStatsResponse getStats();
    List<UserProfileResponse> getAllUsers();
}
