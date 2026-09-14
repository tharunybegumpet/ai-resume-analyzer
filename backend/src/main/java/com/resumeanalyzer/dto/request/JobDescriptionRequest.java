package com.resumeanalyzer.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request payload for POST /job-descriptions (save a JD).
 */
public class JobDescriptionRequest {

    @NotBlank(message = "Job title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @Size(max = 200)
    private String company;

    @NotBlank(message = "Job description content is required")
    private String content;

    private String experienceRequired;

    public String getTitle()              { return title; }
    public void   setTitle(String t)      { this.title = t; }

    public String getCompany()            { return company; }
    public void   setCompany(String c)    { this.company = c; }

    public String getContent()            { return content; }
    public void   setContent(String c)    { this.content = c; }

    public String getExperienceRequired()           { return experienceRequired; }
    public void   setExperienceRequired(String e)   { this.experienceRequired = e; }
}
