package com.resumeanalyzer.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Canonical skill record — tracks every skill seen across all resumes.
 * Used by the admin dashboard to show "Top Skills" and
 * "Most Common Missing Skills" statistics.
 *
 * Table: skills
 *
 * Relationships:
 *  - @ManyToOne user → users table (the user whose resume had this skill)
 *  - @ManyToOne analysis → resume_analysis table
 */
@Entity
@Table(name = "skills",
       indexes = {
           @Index(name = "idx_skill_name",        columnList = "skill_name"),
           @Index(name = "idx_skill_user_id",     columnList = "user_id"),
           @Index(name = "idx_skill_is_missing",  columnList = "is_missing")
       })
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "skill_name", nullable = false, length = 100)
    private String skillName;

    @Column(name = "skill_category", length = 50)
    private String skillCategory;   // e.g. "Technical", "Soft", "Language"

    @Column(name = "is_missing", nullable = false)
    private boolean missing = false;  // true = this was a missing skill for the analysis

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "analysis_id", nullable = false)
    private ResumeAnalysis analysis;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public Skill() {}

    public Skill(String skillName, String skillCategory, boolean missing, User user, ResumeAnalysis analysis) {
        this.skillName     = skillName;
        this.skillCategory = skillCategory;
        this.missing       = missing;
        this.user          = user;
        this.analysis      = analysis;
    }

    // ---- Getters & Setters ----

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getSkillCategory() { return skillCategory; }
    public void setSkillCategory(String skillCategory) { this.skillCategory = skillCategory; }

    public boolean isMissing() { return missing; }
    public void setMissing(boolean missing) { this.missing = missing; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public ResumeAnalysis getAnalysis() { return analysis; }
    public void setAnalysis(ResumeAnalysis analysis) { this.analysis = analysis; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
