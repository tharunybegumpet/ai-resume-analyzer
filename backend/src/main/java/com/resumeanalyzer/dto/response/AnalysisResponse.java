package com.resumeanalyzer.dto.response;

import com.resumeanalyzer.enums.AnalysisStatus;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Full analysis response returned by POST /analysis/analyze
 * and GET /analysis/{id}.
 *
 * List fields (skills, suggestions, etc.) are stored as JSON strings
 * in MySQL and deserialized to List<String> here for clean API responses.
 */
public class AnalysisResponse {

    private Long           id;
    private Long           resumeId;
    private String         resumeFileName;
    private Long           jobDescriptionId;
    private String         jobTitle;
    private AnalysisStatus status;
    private LocalDateTime  analyzedAt;

    // AI Results
    private String       professionalSummary;
    private List<String> candidateStrengths;
    private List<String> weaknesses;
    private List<String> identifiedSkills;
    private List<String> missingSkills;
    private Integer      atsScore;
    private Integer      skillMatchPercentage;
    private String       technicalSkillAnalysis;
    private String       softSkillAnalysis;
    private String       projectEvaluation;
    private String       educationEvaluation;
    private String       experienceEvaluation;
    private List<String> keywordMatch;
    private List<String> improvementSuggestions;
    private List<String> missingCertifications;
    private List<String> missingTechnologies;
    private List<String> recommendedProjects;
    private List<String> recommendedCourses;
    private String       hiringRecommendation;

    // Improvement Module
    private String       improvedSummary;
    private String       improvedSkillsSection;
    private List<String> suggestedKeywords;
    private List<String> actionVerbs;
    private String       grammarSuggestions;

    private String errorMessage;

    // ---- Getters & Setters ----

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getResumeId() { return resumeId; }
    public void setResumeId(Long resumeId) { this.resumeId = resumeId; }

    public String getResumeFileName() { return resumeFileName; }
    public void setResumeFileName(String resumeFileName) { this.resumeFileName = resumeFileName; }

    public Long getJobDescriptionId() { return jobDescriptionId; }
    public void setJobDescriptionId(Long jobDescriptionId) { this.jobDescriptionId = jobDescriptionId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public AnalysisStatus getStatus() { return status; }
    public void setStatus(AnalysisStatus status) { this.status = status; }

    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }

    public String getProfessionalSummary() { return professionalSummary; }
    public void setProfessionalSummary(String s) { this.professionalSummary = s; }

    public List<String> getCandidateStrengths() { return candidateStrengths; }
    public void setCandidateStrengths(List<String> l) { this.candidateStrengths = l; }

    public List<String> getWeaknesses() { return weaknesses; }
    public void setWeaknesses(List<String> l) { this.weaknesses = l; }

    public List<String> getIdentifiedSkills() { return identifiedSkills; }
    public void setIdentifiedSkills(List<String> l) { this.identifiedSkills = l; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> l) { this.missingSkills = l; }

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

    public List<String> getKeywordMatch() { return keywordMatch; }
    public void setKeywordMatch(List<String> l) { this.keywordMatch = l; }

    public List<String> getImprovementSuggestions() { return improvementSuggestions; }
    public void setImprovementSuggestions(List<String> l) { this.improvementSuggestions = l; }

    public List<String> getMissingCertifications() { return missingCertifications; }
    public void setMissingCertifications(List<String> l) { this.missingCertifications = l; }

    public List<String> getMissingTechnologies() { return missingTechnologies; }
    public void setMissingTechnologies(List<String> l) { this.missingTechnologies = l; }

    public List<String> getRecommendedProjects() { return recommendedProjects; }
    public void setRecommendedProjects(List<String> l) { this.recommendedProjects = l; }

    public List<String> getRecommendedCourses() { return recommendedCourses; }
    public void setRecommendedCourses(List<String> l) { this.recommendedCourses = l; }

    public String getHiringRecommendation() { return hiringRecommendation; }
    public void setHiringRecommendation(String s) { this.hiringRecommendation = s; }

    public String getImprovedSummary() { return improvedSummary; }
    public void setImprovedSummary(String s) { this.improvedSummary = s; }

    public String getImprovedSkillsSection() { return improvedSkillsSection; }
    public void setImprovedSkillsSection(String s) { this.improvedSkillsSection = s; }

    public List<String> getSuggestedKeywords() { return suggestedKeywords; }
    public void setSuggestedKeywords(List<String> l) { this.suggestedKeywords = l; }

    public List<String> getActionVerbs() { return actionVerbs; }
    public void setActionVerbs(List<String> l) { this.actionVerbs = l; }

    public String getGrammarSuggestions() { return grammarSuggestions; }
    public void setGrammarSuggestions(String s) { this.grammarSuggestions = s; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String s) { this.errorMessage = s; }
}
