package com.resumeanalyzer.dto.response;

import com.resumeanalyzer.enums.FileType;
import java.time.LocalDateTime;

/**
 * Full resume response — returned after upload and when fetching a single resume.
 * Includes all parsed fields.
 */
public class ResumeResponse {

    private Long         id;
    private String       originalFileName;
    private FileType     fileType;
    private Long         fileSizeBytes;
    private LocalDateTime uploadedAt;

    // Parsed fields
    private String parsedName;
    private String parsedEmail;
    private String parsedPhone;
    private String parsedLinkedin;
    private String parsedGithub;
    private String parsedSummary;
    private String parsedSkills;
    private String parsedEducation;
    private String parsedExperience;
    private String parsedProjects;
    private String parsedCertifications;
    private String parsedLanguages;
    private String parsedAchievements;
    private String parsedInternships;

    // Stats
    private long totalAnalyses;

    // ---- Getters & Setters ----

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }

    public FileType getFileType() { return fileType; }
    public void setFileType(FileType fileType) { this.fileType = fileType; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public String getParsedName() { return parsedName; }
    public void setParsedName(String parsedName) { this.parsedName = parsedName; }

    public String getParsedEmail() { return parsedEmail; }
    public void setParsedEmail(String parsedEmail) { this.parsedEmail = parsedEmail; }

    public String getParsedPhone() { return parsedPhone; }
    public void setParsedPhone(String parsedPhone) { this.parsedPhone = parsedPhone; }

    public String getParsedLinkedin() { return parsedLinkedin; }
    public void setParsedLinkedin(String parsedLinkedin) { this.parsedLinkedin = parsedLinkedin; }

    public String getParsedGithub() { return parsedGithub; }
    public void setParsedGithub(String parsedGithub) { this.parsedGithub = parsedGithub; }

    public String getParsedSummary() { return parsedSummary; }
    public void setParsedSummary(String parsedSummary) { this.parsedSummary = parsedSummary; }

    public String getParsedSkills() { return parsedSkills; }
    public void setParsedSkills(String parsedSkills) { this.parsedSkills = parsedSkills; }

    public String getParsedEducation() { return parsedEducation; }
    public void setParsedEducation(String parsedEducation) { this.parsedEducation = parsedEducation; }

    public String getParsedExperience() { return parsedExperience; }
    public void setParsedExperience(String parsedExperience) { this.parsedExperience = parsedExperience; }

    public String getParsedProjects() { return parsedProjects; }
    public void setParsedProjects(String parsedProjects) { this.parsedProjects = parsedProjects; }

    public String getParsedCertifications() { return parsedCertifications; }
    public void setParsedCertifications(String parsedCertifications) { this.parsedCertifications = parsedCertifications; }

    public String getParsedLanguages() { return parsedLanguages; }
    public void setParsedLanguages(String parsedLanguages) { this.parsedLanguages = parsedLanguages; }

    public String getParsedAchievements() { return parsedAchievements; }
    public void setParsedAchievements(String parsedAchievements) { this.parsedAchievements = parsedAchievements; }

    public String getParsedInternships() { return parsedInternships; }
    public void setParsedInternships(String parsedInternships) { this.parsedInternships = parsedInternships; }

    public long getTotalAnalyses() { return totalAnalyses; }
    public void setTotalAnalyses(long totalAnalyses) { this.totalAnalyses = totalAnalyses; }
}
