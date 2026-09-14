package com.resumeanalyzer.dto.request;

import jakarta.validation.constraints.NotNull;

/**
 * Request payload for POST /analysis/analyze
 *
 * resumeId        — required: which uploaded resume to analyse
 * jobDescriptionId — optional: JD to compare against for ATS scoring
 * targetJobRole   — optional: target job role label (e.g. "Java Backend Developer")
 *                   passed directly to Gemini prompt for role-specific analysis
 */
public class AnalysisRequest {

    @NotNull(message = "Resume ID is required")
    private Long resumeId;

    private Long jobDescriptionId;  // nullable

    private String targetJobRole;   // nullable — e.g. "Java Backend Developer"

    public Long getResumeId() { return resumeId; }
    public void setResumeId(Long resumeId) { this.resumeId = resumeId; }

    public Long getJobDescriptionId() { return jobDescriptionId; }
    public void setJobDescriptionId(Long jobDescriptionId) { this.jobDescriptionId = jobDescriptionId; }

    public String getTargetJobRole() { return targetJobRole; }
    public void setTargetJobRole(String targetJobRole) { this.targetJobRole = targetJobRole; }
}
