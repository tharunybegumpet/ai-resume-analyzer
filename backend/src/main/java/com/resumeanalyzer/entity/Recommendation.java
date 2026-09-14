package com.resumeanalyzer.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Individual AI-generated recommendation for a resume analysis.
 * Each analysis can have many recommendations of different types.
 *
 * Table: recommendations
 *
 * Relationships:
 *  - @ManyToOne analysis → resume_analysis table
 */
@Entity
@Table(name = "recommendations",
       indexes = { @Index(name = "idx_rec_analysis_id", columnList = "analysis_id") })
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "analysis_id", nullable = false)
    private ResumeAnalysis analysis;

    /**
     * Category of the recommendation.
     * e.g. "SKILL", "PROJECT", "COURSE", "CERTIFICATION",
     *       "KEYWORD", "ACTION_VERB", "GRAMMAR", "FORMAT"
     */
    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "title", length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "priority", length = 20)
    private String priority;   // HIGH, MEDIUM, LOW

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public Recommendation() {}

    public Recommendation(ResumeAnalysis analysis, String category,
                          String title, String description, String priority) {
        this.analysis    = analysis;
        this.category    = category;
        this.title       = title;
        this.description = description;
        this.priority    = priority;
    }

    // ---- Getters & Setters ----

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ResumeAnalysis getAnalysis() { return analysis; }
    public void setAnalysis(ResumeAnalysis analysis) { this.analysis = analysis; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
