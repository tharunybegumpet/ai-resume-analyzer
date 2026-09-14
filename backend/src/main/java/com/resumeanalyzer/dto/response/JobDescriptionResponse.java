package com.resumeanalyzer.dto.response;

import java.time.LocalDateTime;

/**
 * Full response for a saved Job Description.
 * Returned by POST, GET /{id}, and the list endpoint.
 */
public class JobDescriptionResponse {

    private Long          id;
    private String        title;
    private String        company;
    private String        content;
    private String        requiredSkills;
    private String        experienceRequired;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private long          totalAnalyses;

    // ---- Getters & Setters ----

    public Long getId()                        { return id; }
    public void setId(Long id)                 { this.id = id; }

    public String getTitle()                   { return title; }
    public void setTitle(String t)             { this.title = t; }

    public String getCompany()                 { return company; }
    public void setCompany(String c)           { this.company = c; }

    public String getContent()                 { return content; }
    public void setContent(String c)           { this.content = c; }

    public String getRequiredSkills()          { return requiredSkills; }
    public void setRequiredSkills(String s)    { this.requiredSkills = s; }

    public String getExperienceRequired()      { return experienceRequired; }
    public void setExperienceRequired(String e){ this.experienceRequired = e; }

    public LocalDateTime getCreatedAt()        { return createdAt; }
    public void setCreatedAt(LocalDateTime t)  { this.createdAt = t; }

    public LocalDateTime getUpdatedAt()        { return updatedAt; }
    public void setUpdatedAt(LocalDateTime t)  { this.updatedAt = t; }

    public long getTotalAnalyses()             { return totalAnalyses; }
    public void setTotalAnalyses(long n)       { this.totalAnalyses = n; }
}
