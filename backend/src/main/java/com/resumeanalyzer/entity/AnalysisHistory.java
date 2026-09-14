package com.resumeanalyzer.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Lightweight audit record for each completed analysis.
 * Used for the history list view — avoids loading the full
 * ResumeAnalysis (with all its TEXT columns) just to show a row.
 *
 * Table: analysis_history
 *
 * Relationships:
 *  - @OneToOne  analysis → resume_analysis table
 *  - @ManyToOne user     → users table
 */
@Entity
@Table(name = "analysis_history",
       indexes = {
           @Index(name = "idx_history_user_id",    columnList = "user_id"),
           @Index(name = "idx_history_ats_score",  columnList = "ats_score"),
           @Index(name = "idx_history_created_at", columnList = "created_at")
       })
public class AnalysisHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_id", nullable = false, unique = true)
    private ResumeAnalysis analysis;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "resume_file_name", length = 255)
    private String resumeFileName;

    @Column(name = "job_title", length = 200)
    private String jobTitle;

    @Column(name = "ats_score")
    private Integer atsScore;

    @Column(name = "skill_match_percentage")
    private Integer skillMatchPercentage;

    @Column(name = "hiring_recommendation", length = 100)
    private String hiringRecommendation;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public AnalysisHistory() {}

    // ---- Getters & Setters ----

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ResumeAnalysis getAnalysis() { return analysis; }
    public void setAnalysis(ResumeAnalysis analysis) { this.analysis = analysis; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getResumeFileName() { return resumeFileName; }
    public void setResumeFileName(String resumeFileName) { this.resumeFileName = resumeFileName; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public Integer getAtsScore() { return atsScore; }
    public void setAtsScore(Integer atsScore) { this.atsScore = atsScore; }

    public Integer getSkillMatchPercentage() { return skillMatchPercentage; }
    public void setSkillMatchPercentage(Integer skillMatchPercentage) { this.skillMatchPercentage = skillMatchPercentage; }

    public String getHiringRecommendation() { return hiringRecommendation; }
    public void setHiringRecommendation(String hiringRecommendation) { this.hiringRecommendation = hiringRecommendation; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
