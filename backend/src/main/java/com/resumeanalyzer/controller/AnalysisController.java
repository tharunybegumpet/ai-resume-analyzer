package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.request.AnalysisRequest;
import com.resumeanalyzer.dto.response.AnalysisResponse;
import com.resumeanalyzer.service.AnalysisService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * AnalysisController — REST endpoints for AI resume analysis.
 *
 * Routes (under /api prefix):
 *  POST /analysis/analyze   → run Gemini analysis on a resume
 *  GET  /analysis/{id}      → fetch a completed analysis by ID
 */
@RestController
@RequestMapping("/analysis")
public class AnalysisController {

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    /**
     * POST /analysis/analyze
     * Triggers the full Gemini analysis pipeline.
     * Body: { "resumeId": 1, "jobDescriptionId": 2 (optional) }
     */
    @PostMapping("/analyze")
    public ResponseEntity<AnalysisResponse> analyze(
            @Valid @RequestBody AnalysisRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                analysisService.analyze(request, userDetails.getUsername()));
    }

    /**
     * GET /analysis/{id}
     * Returns the full analysis result for the given ID.
     * Only the owning user can access their own analyses.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AnalysisResponse> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                analysisService.getById(id, userDetails.getUsername()));
    }
}
