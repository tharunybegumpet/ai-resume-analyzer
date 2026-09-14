package com.resumeanalyzer.dto.response;

import com.resumeanalyzer.enums.FileType;
import java.time.LocalDateTime;

/**
 * Lightweight resume summary for list views.
 * Does NOT include extracted text or full parsed sections.
 */
public class ResumeSummaryResponse {

    private Long         id;
    private String       originalFileName;
    private FileType     fileType;
    private Long         fileSizeBytes;
    private String       parsedName;
    private String       parsedEmail;
    private LocalDateTime uploadedAt;
    private long         totalAnalyses;

    // ---- Getters & Setters ----

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String n) { this.originalFileName = n; }

    public FileType getFileType() { return fileType; }
    public void setFileType(FileType t) { this.fileType = t; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long s) { this.fileSizeBytes = s; }

    public String getParsedName() { return parsedName; }
    public void setParsedName(String n) { this.parsedName = n; }

    public String getParsedEmail() { return parsedEmail; }
    public void setParsedEmail(String e) { this.parsedEmail = e; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime t) { this.uploadedAt = t; }

    public long getTotalAnalyses() { return totalAnalyses; }
    public void setTotalAnalyses(long n) { this.totalAnalyses = n; }
}
