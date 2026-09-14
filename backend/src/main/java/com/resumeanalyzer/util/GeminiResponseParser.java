package com.resumeanalyzer.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyzer.entity.ResumeAnalysis;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * GeminiResponseParser — parses Gemini's raw text output into a
 * populated ResumeAnalysis entity.
 *
 * Gemini sometimes wraps JSON in markdown fences (```json ... ```)
 * even when instructed not to — this parser strips those first.
 *
 * All list fields are stored as JSON arrays in TEXT columns
 * (e.g. ["Java","Python"]) so the frontend can JSON.parse() them directly.
 */
@Component
public class GeminiResponseParser {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Parses Gemini's text and populates the given ResumeAnalysis entity.
     * Caller is responsible for setting resume, user, jobDescription, and saving.
     */
    public void parse(String rawText, ResumeAnalysis analysis) {
        String json = stripFences(rawText.trim());

        try {
            JsonNode root = objectMapper.readTree(json);

            analysis.setProfessionalSummary(text(root, "professionalSummary"));
            analysis.setCandidateStrengths(array(root, "candidateStrengths"));
            analysis.setWeaknesses(array(root, "weaknesses"));
            analysis.setIdentifiedSkills(array(root, "identifiedSkills"));
            analysis.setMissingSkills(array(root, "missingSkills"));
            analysis.setAtsScore(clamp(root.path("atsScore").asInt(0)));
            analysis.setSkillMatchPercentage(clamp(root.path("skillMatchPercentage").asInt(0)));
            analysis.setTechnicalSkillAnalysis(text(root, "technicalSkillAnalysis"));
            analysis.setSoftSkillAnalysis(text(root, "softSkillAnalysis"));
            analysis.setProjectEvaluation(text(root, "projectEvaluation"));
            analysis.setEducationEvaluation(text(root, "educationEvaluation"));
            analysis.setExperienceEvaluation(text(root, "experienceEvaluation"));
            analysis.setKeywordMatch(array(root, "keywordMatch"));
            analysis.setImprovementSuggestions(array(root, "improvementSuggestions"));
            analysis.setMissingCertifications(array(root, "missingCertifications"));
            analysis.setMissingTechnologies(array(root, "missingTechnologies"));
            analysis.setRecommendedProjects(array(root, "recommendedProjects"));
            analysis.setRecommendedCourses(array(root, "recommendedCourses"));
            analysis.setHiringRecommendation(text(root, "hiringRecommendation"));
            analysis.setImprovedSummary(text(root, "improvedSummary"));
            analysis.setImprovedSkillsSection(text(root, "improvedSkillsSection"));
            analysis.setSuggestedKeywords(array(root, "suggestedKeywords"));
            analysis.setActionVerbs(array(root, "actionVerbs"));
            analysis.setGrammarSuggestions(text(root, "grammarSuggestions"));

        } catch (Exception e) {
            throw new RuntimeException(
                "Failed to parse Gemini JSON response: " + e.getMessage() +
                "\nRaw text:\n" + rawText.substring(0, Math.min(500, rawText.length())), e);
        }
    }

    // ---- Helpers ----

    /** Strips optional ```json ... ``` markdown fences. */
    private String stripFences(String text) {
        if (text.startsWith("```")) {
            int newline = text.indexOf('\n');
            if (newline != -1) text = text.substring(newline + 1);
        }
        if (text.endsWith("```")) {
            text = text.substring(0, text.lastIndexOf("```")).trim();
        }
        return text.trim();
    }

    /** Returns text value of a JSON field, or null if missing. */
    private String text(JsonNode root, String field) {
        JsonNode node = root.path(field);
        return (node.isMissingNode() || node.isNull()) ? null : node.asText(null);
    }

    /**
     * Converts a JSON array node to a JSON array string.
     * e.g. ["Java", "Python"] → stored as-is in TEXT column.
     * Returns null if field is missing.
     */
    private String array(JsonNode root, String field) {
        JsonNode node = root.path(field);
        if (node.isMissingNode() || node.isNull() || !node.isArray()) return null;
        List<String> list = new ArrayList<>();
        for (JsonNode item : node) {
            String val = item.asText("").trim();
            if (!val.isEmpty()) list.add(val);
        }
        if (list.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            return null;
        }
    }

    /** Clamps a score to [0, 100]. */
    private int clamp(int val) {
        return Math.max(0, Math.min(100, val));
    }
}
