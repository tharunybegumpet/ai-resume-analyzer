package com.resumeanalyzer.dto.response;

import java.util.Set;

/**
 * Response payload for both /auth/register and /auth/login.
 *
 * Contains the JWT token and basic user info so the frontend
 * can populate the AuthContext without a separate profile API call.
 */
public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private Long   userId;
    private String fullName;
    private String email;
    private Set<String> roles;

    public AuthResponse() {}

    public AuthResponse(String token, Long userId, String fullName,
                        String email, Set<String> roles) {
        this.token    = token;
        this.userId   = userId;
        this.fullName = fullName;
        this.email    = email;
        this.roles    = roles;
    }

    public String getToken()       { return token; }
    public void   setToken(String token) { this.token = token; }

    public String getTokenType()   { return tokenType; }

    public Long   getUserId()      { return userId; }
    public void   setUserId(Long userId) { this.userId = userId; }

    public String getFullName()    { return fullName; }
    public void   setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail()       { return email; }
    public void   setEmail(String email) { this.email = email; }

    public Set<String> getRoles()  { return roles; }
    public void   setRoles(Set<String> roles) { this.roles = roles; }
}
