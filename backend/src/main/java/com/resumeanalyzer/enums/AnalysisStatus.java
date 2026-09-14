package com.resumeanalyzer.enums;

/**
 * Status of a resume analysis job.
 * PENDING    → uploaded but not yet analyzed
 * PROCESSING → Gemini API call in progress
 * COMPLETED  → analysis stored successfully
 * FAILED     → analysis failed (Gemini error, parse error, etc.)
 */
public enum AnalysisStatus {
    PENDING,
    PROCESSING,
    COMPLETED,
    FAILED
}
