package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.request.LoginRequest;
import com.resumeanalyzer.dto.request.RegisterRequest;
import com.resumeanalyzer.dto.request.UpdateProfileRequest;
import com.resumeanalyzer.dto.response.AuthResponse;
import com.resumeanalyzer.dto.response.UserProfileResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserProfileResponse getProfile(String email);
    UserProfileResponse updateProfile(String email, UpdateProfileRequest request);
}
