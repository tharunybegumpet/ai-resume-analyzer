package com.resumeanalyzer.dto.request;

import jakarta.validation.constraints.Size;

/**
 * Request payload for PUT /auth/profile
 */
public class UpdateProfileRequest {

    @Size(min = 2, max = 100)
    private String fullName;

    private String phone;
    private String profileHeadline;
    private String linkedinUrl;
    private String githubUrl;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getProfileHeadline() { return profileHeadline; }
    public void setProfileHeadline(String profileHeadline) { this.profileHeadline = profileHeadline; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
}
