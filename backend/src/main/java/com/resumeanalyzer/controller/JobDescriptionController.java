package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.request.JobDescriptionRequest;
import com.resumeanalyzer.dto.response.JobDescriptionResponse;
import com.resumeanalyzer.service.JobDescriptionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * JobDescriptionController — REST endpoints for managing saved JDs.
 *
 * Routes (under /api prefix):
 *  POST   /job-descriptions           → save a new JD
 *  GET    /job-descriptions           → list all JDs for current user
 *  GET    /job-descriptions/{id}      → get full JD by ID
 *  PUT    /job-descriptions/{id}      → update a JD
 *  DELETE /job-descriptions/{id}      → soft-delete a JD
 */
@RestController
@RequestMapping("/job-descriptions")
public class JobDescriptionController {

    private final JobDescriptionService jobDescriptionService;

    public JobDescriptionController(JobDescriptionService jobDescriptionService) {
        this.jobDescriptionService = jobDescriptionService;
    }

    // POST /job-descriptions
    @PostMapping
    public ResponseEntity<JobDescriptionResponse> save(
            @Valid @RequestBody JobDescriptionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(jobDescriptionService.save(request, userDetails.getUsername()));
    }

    // GET /job-descriptions
    @GetMapping
    public ResponseEntity<List<JobDescriptionResponse>> getAll(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobDescriptionService.getAll(userDetails.getUsername()));
    }

    // GET /job-descriptions/{id}
    @GetMapping("/{id}")
    public ResponseEntity<JobDescriptionResponse> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                jobDescriptionService.getById(id, userDetails.getUsername()));
    }

    // PUT /job-descriptions/{id}
    @PutMapping("/{id}")
    public ResponseEntity<JobDescriptionResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody JobDescriptionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                jobDescriptionService.update(id, request, userDetails.getUsername()));
    }

    // DELETE /job-descriptions/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        jobDescriptionService.delete(id, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Job description deleted successfully."));
    }
}
