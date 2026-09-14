package com.resumeanalyzer.dto.response;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * Response payload for GET /auth/profile and PUT /auth/profile.
 * Never exposes the password hash.
 */
public class UserProfileResponse {

    private Long   id;
    private String fullName;
    private String email;
    private String phone;
    private String profileHeadline;
    private String linkedinUrl;
    private String githubUrl;
    private Set<String> roles;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private long   totalResumes;
    private long   totalAnalyses;

    public UserProfileResponse() {}

    // ---- Getters & Setters ----

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getProfileHeadline() { return profileHeadline; }
    public void setProfileHeadline(String profileHeadline) { this.profileHeadline = profileHeadline; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }

    public long getTotalResumes() { return totalResumes; }
    public void setTotalResumes(long totalResumes) { this.totalResumes = totalResumes; }

    public long getTotalAnalyses() { return totalAnalyses; }
    public void setTotalAnalyses(long totalAnalyses) { this.totalAnalyses = totalAnalyses; }
}
