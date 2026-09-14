package com.resumeanalyzer.entity;

import com.resumeanalyzer.enums.AnalysisStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Core analysis result entity — stores everything Gemini returns.
 *
 * Table: resume_analysis
 *
 * Relationships:
 *  - @ManyToOne  resume         → resumes table
 *  - @ManyToOne  jobDescription → job_descriptions table (nullable)
 *  - @ManyToOne  user           → users table (denormalized for fast queries)
 *  - @OneToMany  recommendations→ recommendations table
 *  - @OneToOne   history        → analysis_history table
 */
@Entity
@Table(name = "resume_analysis")
public class ResumeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_description_id")
    private JobDescription jobDescription;

    // Denormalized — avoids joining through resume every time
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AnalysisStatus status = AnalysisStatus.PENDING;

    // ---- AI Results ----

    @Column(name = "professional_summary", columnDefinition = "TEXT")
    private String professionalSummary;

    @Column(name = "candidate_strengths", columnDefinition = "TEXT")
    private String candidateStrengths;       // JSON array string

    @Column(name = "weaknesses", columnDefinition = "TEXT")
    private String weaknesses;               // JSON array string

    @Column(name = "identified_skills", columnDefinition = "TEXT")
    private String identifiedSkills;         // JSON array string

    @Column(name = "missing_skills", columnDefinition = "TEXT")
    private String missingSkills;            // JSON array string

    @Column(name = "ats_score")
    private Integer atsScore;

    @Column(name = "skill_match_percentage")
    private Integer skillMatchPercentage;

    @Column(name = "technical_skill_analysis", columnDefinition = "TEXT")
    private String technicalSkillAnalysis;

    @Column(name = "soft_skill_analysis", columnDefinition = "TEXT")
    private String softSkillAnalysis;

    @Column(name = "project_evaluation", columnDefinition = "TEXT")
    private String projectEvaluation;

    @Column(name = "education_evaluation", columnDefinition = "TEXT")
    private String educationEvaluation;

    @Column(name = "experience_evaluation", columnDefinition = "TEXT")
    private String experienceEvaluation;

    @Column(name = "keyword_match", columnDefinition = "TEXT")
    private String keywordMatch;             // JSON array string

    @Column(name = "improvement_suggestions", columnDefinition = "TEXT")
    private String improvementSuggestions;   // JSON array string

    @Column(name = "missing_certifications", columnDefinition = "TEXT")
    private String missingCertifications;    // JSON array string

    @Column(name = "missing_technologies", columnDefinition = "TEXT")
    private String missingTechnologies;      // JSON array string

    @Column(name = "recommended_projects", columnDefinition = "TEXT")
    private String recommendedProjects;      // JSON array string

    @Column(name = "recommended_courses", columnDefinition = "TEXT")
    private String recommendedCourses;       // JSON array string

    @Column(name = "hiring_recommendation", columnDefinition = "TEXT")
    private String hiringRecommendation;

    // ---- Improvement Module ----

    @Column(name = "improved_summary", columnDefinition = "TEXT")
    private String improvedSummary;

    @Column(name = "improved_skills_section", columnDefinition = "TEXT")
    private String improvedSkillsSection;

    @Column(name = "suggested_keywords", columnDefinition = "TEXT")
    private String suggestedKeywords;        // JSON array string

    @Column(name = "action_verbs", columnDefinition = "TEXT")
    private String actionVerbs;              // JSON array string

    @Column(name = "grammar_suggestions", columnDefinition = "TEXT")
    private String grammarSuggestions;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "analyzed_at")
    private LocalDateTime analyzedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "analysis", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Recommendation> recommendations = new ArrayList<>();

    @OneToOne(mappedBy = "analysis", cascade = CascadeType.ALL, orphanRemoval = true)
    private AnalysisHistory history;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public ResumeAnalysis() {}

    // ---- Getters & Setters ----

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Resume getResume() { return resume; }
    public void setResume(Resume resume) { this.resume = resume; }

    public JobDescription getJobDescription() { return jobDescription; }
    public void setJobDescription(JobDescription jobDescription) { this.jobDescription = jobDescription; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public AnalysisStatus getStatus() { return status; }
    public void setStatus(AnalysisStatus status) { this.status = status; }

    public String getProfessionalSummary() { return professionalSummary; }
    public void setProfessionalSummary(String s) { this.professionalSummary = s; }

    public String getCandidateStrengths() { return candidateStrengths; }
    public void setCandidateStrengths(String s) { this.candidateStrengths = s; }

    public String getWeaknesses() { return weaknesses; }
    public void setWeaknesses(String s) { this.weaknesses = s; }

    public String getIdentifiedSkills() { return identifiedSkills; }
    public void setIdentifiedSkills(String s) { this.identifiedSkills = s; }

    public String getMissingSkills() { return missingSkills; }
    public void setMissingSkills(String s) { this.missingSkills = s; }

    public Integer getAtsScore() { return atsScore; }
    public void setAtsScore(Integer atsScore) { this.atsScore = atsScore; }

    public Integer getSkillMatchPercentage() { return skillMatchPercentage; }
    public void setSkillMatchPercentage(Integer s) { this.skillMatchPercentage = s; }

    public String getTechnicalSkillAnalysis() { return technicalSkillAnalysis; }
    public void setTechnicalSkillAnalysis(String s) { this.technicalSkillAnalysis = s; }

    public String getSoftSkillAnalysis() { return softSkillAnalysis; }
    public void setSoftSkillAnalysis(String s) { this.softSkillAnalysis = s; }

    public String getProjectEvaluation() { return projectEvaluation; }
    public void setProjectEvaluation(String s) { this.projectEvaluation = s; }

    public String getEducationEvaluation() { return educationEvaluation; }
    public void setEducationEvaluation(String s) { this.educationEvaluation = s; }

    public String getExperienceEvaluation() { return experienceEvaluation; }
    public void setExperienceEvaluation(String s) { this.experienceEvaluation = s; }

    public String getKeywordMatch() { return keywordMatch; }
    public void setKeywordMatch(String s) { this.keywordMatch = s; }

    public String getImprovementSuggestions() { return improvementSuggestions; }
    public void setImprovementSuggestions(String s) { this.improvementSuggestions = s; }

    public String getMissingCertifications() { return missingCertifications; }
    public void setMissingCertifications(String s) { this.missingCertifications = s; }

    public String getMissingTechnologies() { return missingTechnologies; }
    public void setMissingTechnologies(String s) { this.missingTechnologies = s; }

    public String getRecommendedProjects() { return recommendedProjects; }
    public void setRecommendedProjects(String s) { this.recommendedProjects = s; }

    public String getRecommendedCourses() { return recommendedCourses; }
    public void setRecommendedCourses(String s) { this.recommendedCourses = s; }

    public String getHiringRecommendation() { return hiringRecommendation; }
    public void setHiringRecommendation(String s) { this.hiringRecommendation = s; }

    public String getImprovedSummary() { return improvedSummary; }
    public void setImprovedSummary(String s) { this.improvedSummary = s; }

    public String getImprovedSkillsSection() { return improvedSkillsSection; }
    public void setImprovedSkillsSection(String s) { this.improvedSkillsSection = s; }

    public String getSuggestedKeywords() { return suggestedKeywords; }
    public void setSuggestedKeywords(String s) { this.suggestedKeywords = s; }

    public String getActionVerbs() { return actionVerbs; }
    public void setActionVerbs(String s) { this.actionVerbs = s; }

    public String getGrammarSuggestions() { return grammarSuggestions; }
    public void setGrammarSuggestions(String s) { this.grammarSuggestions = s; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String s) { this.errorMessage = s; }

    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime t) { this.analyzedAt = t; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public List<Recommendation> getRecommendations() { return recommendations; }
    public AnalysisHistory getHistory() { return history; }
}
