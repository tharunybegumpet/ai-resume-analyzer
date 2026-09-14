package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.response.HistoryItemResponse;
import com.resumeanalyzer.service.HistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Routes:
 *  GET    /analysis/history          → list (sortBy=date|score)
 *  GET    /analysis/history/search   → search by filename/job title
 *  DELETE /analysis/history/{id}     → delete a history record
 */
@RestController
@RequestMapping("/analysis/history")
public class HistoryController {

    private final HistoryService historyService;

    public HistoryController(HistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping
    public ResponseEntity<List<HistoryItemResponse>> getHistory(
            @RequestParam(defaultValue = "date") String sortBy,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(historyService.getHistory(userDetails.getUsername(), sortBy));
    }

    @GetMapping("/search")
    public ResponseEntity<List<HistoryItemResponse>> search(
            @RequestParam String q,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(historyService.search(userDetails.getUsername(), q));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        historyService.delete(id, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Deleted successfully."));
    }
}
