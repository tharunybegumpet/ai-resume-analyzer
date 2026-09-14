package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.response.ResumeResponse;
import com.resumeanalyzer.dto.response.ResumeSummaryResponse;
import com.resumeanalyzer.service.ResumeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * ResumeController — REST endpoints for resume management.
 *
 * All endpoints require a valid JWT (enforced by SecurityConfig).
 * The currently logged-in user is identified via @AuthenticationPrincipal.
 *
 * Routes (under /api prefix):
 *  POST   /resumes/upload      → upload PDF or DOCX resume
 *  GET    /resumes             → list all resumes for the current user
 *  GET    /resumes/{id}        → get full details of a specific resume
 *  DELETE /resumes/{id}        → soft-delete a resume
 */
@RestController
@RequestMapping("/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    // POST /resumes/upload
    @PostMapping("/upload")
    public ResponseEntity<ResumeResponse> upload(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        ResumeResponse response = resumeService.upload(file, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET /resumes
    @GetMapping
    public ResponseEntity<List<ResumeSummaryResponse>> getMyResumes(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(resumeService.getMyResumes(userDetails.getUsername()));
    }

    // GET /resumes/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ResumeResponse> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(resumeService.getById(id, userDetails.getUsername()));
    }

    // DELETE /resumes/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        resumeService.delete(id, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Resume deleted successfully."));
    }
}
