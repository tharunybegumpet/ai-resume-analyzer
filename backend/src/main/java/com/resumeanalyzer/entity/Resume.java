package com.resumeanalyzer.entity;

import com.resumeanalyzer.enums.FileType;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents an uploaded resume file.
 *
 * Table: resumes
 *
 * Stores:
 *  - File metadata (name, type, size, storage path)
 *  - Extracted text (raw text pulled from PDF/DOCX)
 *  - Parsed fields (name, email, phone, etc.)
 *  - Link back to the owning user
 *
 * Relationships:
 *  - @ManyToOne user         → users table
 *  - @OneToMany analyses     → resume_analysis table
 */
@Entity
@Table(name = "resumes")
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "original_file_name", nullable = false, length = 255)
    private String originalFileName;

    @Column(name = "stored_file_name", nullable = false, length = 255)
    private String storedFileName;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Enumerated(EnumType.STRING)
    @Column(name = "file_type", nullable = false, length = 10)
    private FileType fileType;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    // ---- Extracted raw text ----
    @Column(name = "extracted_text", columnDefinition = "LONGTEXT")
    private String extractedText;

    // ---- Parsed fields from the resume ----
    @Column(name = "parsed_name",        length = 150)
    private String parsedName;

    @Column(name = "parsed_email",       length = 150)
    private String parsedEmail;

    @Column(name = "parsed_phone",       length = 30)
    private String parsedPhone;

    @Column(name = "parsed_linkedin",    length = 300)
    private String parsedLinkedin;

    @Column(name = "parsed_github",      length = 300)
    private String parsedGithub;

    @Column(name = "parsed_summary",     columnDefinition = "TEXT")
    private String parsedSummary;

    @Column(name = "parsed_skills",      columnDefinition = "TEXT")
    private String parsedSkills;          // comma-separated

    @Column(name = "parsed_education",   columnDefinition = "TEXT")
    private String parsedEducation;

    @Column(name = "parsed_experience",  columnDefinition = "TEXT")
    private String parsedExperience;

    @Column(name = "parsed_projects",    columnDefinition = "TEXT")
    private String parsedProjects;

    @Column(name = "parsed_certifications", columnDefinition = "TEXT")
    private String parsedCertifications;

    @Column(name = "parsed_languages",   columnDefinition = "TEXT")
    private String parsedLanguages;

    @Column(name = "parsed_achievements", columnDefinition = "TEXT")
    private String parsedAchievements;

    @Column(name = "parsed_internships", columnDefinition = "TEXT")
    private String parsedInternships;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ResumeAnalysis> analyses = new ArrayList<>();

    // ---- Lifecycle ----

    @PrePersist
    protected void onCreate() { uploadedAt = LocalDateTime.now(); }

    // ---- Constructors ----

    public Resume() {}

    // ---- Getters & Setters ----

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }

    public String getStoredFileName() { return storedFileName; }
    public void setStoredFileName(String storedFileName) { this.storedFileName = storedFileName; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public FileType getFileType() { return fileType; }
    public void setFileType(FileType fileType) { this.fileType = fileType; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }

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

    public LocalDateTime getUploadedAt() { return uploadedAt; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public List<ResumeAnalysis> getAnalyses() { return analyses; }
}
