package com.resumeanalyzer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the AI Resume Analyzer Spring Boot application.
 *
 * Package structure:
 *  com.resumeanalyzer
 *  ├── config          → CORS, Security, JWT, App beans
 *  ├── controller      → REST controllers (Auth, Resume, Analysis, Dashboard, Admin)
 *  ├── dto
 *  │   ├── request     → Incoming request payloads
 *  │   └── response    → Outgoing response payloads
 *  ├── entity          → JPA entities (DB tables)
 *  ├── enums           → Role, FileType, AnalysisStatus
 *  ├── exception       → Custom exceptions + Global handler
 *  ├── mapper          → Entity ↔ DTO converters
 *  ├── repository      → Spring Data JPA repositories
 *  ├── security        → JWT filter, UserDetailsService
 *  ├── service         → Service interfaces
 *  │   └── impl        → Service implementations
 *  └── util            → PDF/DOCX extractor, Gemini client
 */
@SpringBootApplication
public class ResumeAnalyzerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ResumeAnalyzerApplication.class, args);
    }
}
