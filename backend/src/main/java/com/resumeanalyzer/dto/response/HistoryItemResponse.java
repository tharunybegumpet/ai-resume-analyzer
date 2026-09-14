package com.resumeanalyzer.dto.response;

import java.time.LocalDateTime;

/**
 * Lightweight history row — used in dashboard recent activity
 * and the full history list page.
 */
public class HistoryItemResponse {

    private Long          id;
    private Long          analysisId;
    private String        resumeFileName;
    private String        jobTitle;
    private Integer       atsScore;
    private Integer       skillMatchPercentage;
    private String        hiringRecommendation;
    private LocalDateTime createdAt;

    public Long getId()                           { return id; }
    public void setId(Long id)                    { this.id = id; }

    public Long getAnalysisId()                   { return analysisId; }
    public void setAnalysisId(Long analysisId)    { this.analysisId = analysisId; }

    public String getResumeFileName()             { return resumeFileName; }
    public void setResumeFileName(String s)       { this.resumeFileName = s; }

    public String getJobTitle()                   { return jobTitle; }
    public void setJobTitle(String s)             { this.jobTitle = s; }

    public Integer getAtsScore()                  { return atsScore; }
    public void setAtsScore(Integer s)            { this.atsScore = s; }

    public Integer getSkillMatchPercentage()      { return skillMatchPercentage; }
    public void setSkillMatchPercentage(Integer s){ this.skillMatchPercentage = s; }

    public String getHiringRecommendation()       { return hiringRecommendation; }
    public void setHiringRecommendation(String s) { this.hiringRecommendation = s; }

    public LocalDateTime getCreatedAt()           { return createdAt; }
    public void setCreatedAt(LocalDateTime t)     { this.createdAt = t; }
}
