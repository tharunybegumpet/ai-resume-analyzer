package com.resumeanalyzer.service.impl;

import com.resumeanalyzer.dto.request.LoginRequest;
import com.resumeanalyzer.dto.request.RegisterRequest;
import com.resumeanalyzer.dto.request.UpdateProfileRequest;
import com.resumeanalyzer.dto.response.AuthResponse;
import com.resumeanalyzer.dto.response.UserProfileResponse;
import com.resumeanalyzer.entity.User;
import com.resumeanalyzer.enums.Role;
import com.resumeanalyzer.exception.BadRequestException;
import com.resumeanalyzer.exception.ResourceNotFoundException;
import com.resumeanalyzer.repository.ResumeAnalysisRepository;
import com.resumeanalyzer.repository.ResumeRepository;
import com.resumeanalyzer.repository.UserRepository;
import com.resumeanalyzer.security.JwtUtil;
import com.resumeanalyzer.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * AuthServiceImpl — handles all authentication business logic.
 *
 * register():
 *   1. Check email uniqueness
 *   2. Hash password with BCrypt
 *   3. Assign ROLE_USER by default
 *   4. Save user to MySQL
 *   5. Generate and return JWT
 *
 * login():
 *   1. AuthenticationManager validates credentials against DB
 *   2. Update lastLoginAt timestamp
 *   3. Generate and return JWT
 */
@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository           userRepository;
    private final ResumeRepository         resumeRepository;
    private final ResumeAnalysisRepository analysisRepository;
    private final PasswordEncoder          passwordEncoder;
    private final JwtUtil                  jwtUtil;
    private final AuthenticationManager   authenticationManager;
    private final UserDetailsService       userDetailsService;

    public AuthServiceImpl(UserRepository userRepository,
                           ResumeRepository resumeRepository,
                           ResumeAnalysisRepository analysisRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil,
                           AuthenticationManager authenticationManager,
                           UserDetailsService userDetailsService) {
        this.userRepository        = userRepository;
        this.resumeRepository      = resumeRepository;
        this.analysisRepository    = analysisRepository;
        this.passwordEncoder       = passwordEncoder;
        this.jwtUtil               = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.userDetailsService    = userDetailsService;
    }

    // ---- Register ----

    @Override
    public AuthResponse register(RegisterRequest request) {
        // Prevent duplicate registrations
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException(
                    "An account with email '" + request.getEmail() + "' already exists.");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.getRoles().add(Role.ROLE_USER);  // default role

        User saved = userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(saved.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return buildAuthResponse(token, saved);
    }

    // ---- Login ----

    @Override
    public AuthResponse login(LoginRequest request) {
        // Throws BadCredentialsException if invalid — handled by GlobalExceptionHandler
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        // Update last login timestamp
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return buildAuthResponse(token, user);
    }

    // ---- Profile ----

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String email) {
        User user = getByEmail(email);
        return toProfileResponse(user);
    }

    @Override
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = getByEmail(email);

        if (request.getFullName()       != null) user.setFullName(request.getFullName());
        if (request.getPhone()          != null) user.setPhone(request.getPhone());
        if (request.getProfileHeadline()!= null) user.setProfileHeadline(request.getProfileHeadline());
        if (request.getLinkedinUrl()    != null) user.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getGithubUrl()      != null) user.setGithubUrl(request.getGithubUrl());

        return toProfileResponse(userRepository.save(user));
    }

    // ---- Helpers ----

    private User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private AuthResponse buildAuthResponse(String token, User user) {
        Set<String> roleNames = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());
        return new AuthResponse(token, user.getId(), user.getFullName(),
                                user.getEmail(), roleNames);
    }

    private UserProfileResponse toProfileResponse(User user) {
        UserProfileResponse resp = new UserProfileResponse();
        resp.setId(user.getId());
        resp.setFullName(user.getFullName());
        resp.setEmail(user.getEmail());
        resp.setPhone(user.getPhone());
        resp.setProfileHeadline(user.getProfileHeadline());
        resp.setLinkedinUrl(user.getLinkedinUrl());
        resp.setGithubUrl(user.getGithubUrl());
        resp.setRoles(user.getRoles().stream().map(Enum::name).collect(Collectors.toSet()));
        resp.setCreatedAt(user.getCreatedAt());
        resp.setLastLoginAt(user.getLastLoginAt());
        resp.setTotalResumes(resumeRepository.countByUserId(user.getId()));
        resp.setTotalAnalyses(analysisRepository.countByUserId(user.getId()));
        return resp;
    }
}
