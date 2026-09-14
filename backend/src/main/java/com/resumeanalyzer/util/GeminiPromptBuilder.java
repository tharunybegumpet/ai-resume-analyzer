package com.resumeanalyzer.util;

import org.springframework.stereotype.Component;

/**
 * GeminiPromptBuilder — constructs the structured prompt sent to Gemini.
 *
 * The prompt is engineered to always return a strict JSON object with
 * all required fields. Key design decisions:
 *
 *  1. Explicit JSON schema in the prompt (most reliable way to get
 *     structured output from a generative model).
 *  2. Temperature 0.2 on GeminiClient keeps responses consistent.
 *  3. Separate analysis and improvement sections in one call to
 *     minimize API round-trips.
 *  4. The Job Description is optional — if not provided, Gemini
 *     analyses the resume as a standalone document.
 */
@Component
public class GeminiPromptBuilder {

    /**
     * Builds the full analysis prompt.
     *
     * @param resumeText     extracted plain text from the resume
     * @param jobDescription full JD content (nullable)
     * @param requiredSkills comma-separated skills from the JD (nullable)
     * @param jobTitle       title of the JD (nullable)
     * @param targetJobRole  target job role selected by user (nullable)
     */
    public String buildAnalysisPrompt(String resumeText,
                                      String jobDescription,
                                      String requiredSkills,
                                      String jobTitle,
                                      String targetJobRole) {
        String jdSection = buildJdSection(jobDescription, requiredSkills, jobTitle, targetJobRole);

        return """
You are a senior AI-powered HR analyst and ATS (Applicant Tracking System) expert.
Analyse the following resume%s and respond ONLY with a valid JSON object.
Do NOT include markdown code fences, explanations, or any text outside the JSON.

Return EXACTLY this JSON structure (all fields required):
{
  "professionalSummary": "<2-3 sentence professional summary of the candidate>",
  "candidateStrengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "identifiedSkills": ["<skill1>", "<skill2>", ...],
  "missingSkills": ["<skill1>", "<skill2>", ...],
  "atsScore": <integer 0-100>,
  "skillMatchPercentage": <integer 0-100>,
  "technicalSkillAnalysis": "<paragraph analysing technical skills depth and breadth>",
  "softSkillAnalysis": "<paragraph analysing communication, leadership, teamwork, etc.>",
  "projectEvaluation": "<paragraph evaluating projects: relevance, complexity, impact>",
  "educationEvaluation": "<paragraph evaluating education: institution, degree, relevance>",
  "experienceEvaluation": "<paragraph evaluating work experience: roles, years, relevance>",
  "keywordMatch": ["<matched_keyword1>", "<matched_keyword2>", ...],
  "improvementSuggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>", "<suggestion4>", "<suggestion5>"],
  "missingCertifications": ["<cert1>", "<cert2>"],
  "missingTechnologies": ["<tech1>", "<tech2>"],
  "recommendedProjects": ["<project_idea1>", "<project_idea2>"],
  "recommendedCourses": ["<course1>", "<course2>", "<course3>"],
  "hiringRecommendation": "<one of: STRONG_HIRE | HIRE | CONSIDER | REJECT> — followed by 1-2 sentence justification",
  "improvedSummary": "<rewritten professional summary section for the resume>",
  "improvedSkillsSection": "<rewritten skills section with better formatting and additional relevant skills>",
  "suggestedKeywords": ["<keyword1>", "<keyword2>", "<keyword3>", "<keyword4>", "<keyword5>"],
  "actionVerbs": ["<verb1>", "<verb2>", "<verb3>", "<verb4>", "<verb5>"],
  "grammarSuggestions": "<paragraph with specific grammar, formatting, and language improvement tips>"
}

Scoring rules for atsScore (0-100):
- Skills match with JD/target role:              30 points
- Relevant work experience (years + quality):    25 points
- Education and certifications:                  15 points
- Projects (complexity, relevance, impact):      15 points
- Resume formatting (clarity, ATS-readability):  10 points
- Achievements and quantifiable results:          5 points

skillMatchPercentage: percentage of required skills found in the resume (0 if no JD or role provided).

%s

Resume Text:
---
%s
---
""".formatted(
            buildTitleSuffix(jobTitle, targetJobRole),
            jdSection,
            truncate(resumeText, 12000)
        );
    }

    private String buildTitleSuffix(String jobTitle, String targetJobRole) {
        if (jobTitle != null && !jobTitle.isBlank())
            return " against the job description for '" + jobTitle + "'" +
                   (targetJobRole != null ? " targeting the role of '" + targetJobRole + "'" : "");
        if (targetJobRole != null && !targetJobRole.isBlank())
            return " for the target role of '" + targetJobRole + "'";
        return "";
    }

    private String buildJdSection(String jobDescription, String requiredSkills,
                                  String jobTitle, String targetJobRole) {
        StringBuilder sb = new StringBuilder();

        // Target role section (always included if provided)
        if (targetJobRole != null && !targetJobRole.isBlank()) {
            sb.append("Target Job Role: ").append(targetJobRole).append("\n");
            sb.append("Analyse this resume specifically for suitability as a ")
              .append(targetJobRole)
              .append(". Score atsScore and skillMatchPercentage based on how well ")
              .append("the resume matches typical ").append(targetJobRole).append(" requirements.\n\n");
        }

        if (jobDescription == null || jobDescription.isBlank()) {
            if (targetJobRole != null && !targetJobRole.isBlank()) {
                sb.append("Note: No explicit job description provided. Use standard industry requirements ")
                  .append("for a ").append(targetJobRole).append(" role to evaluate this resume.\n");
            } else {
                sb.append("Note: No job description or target role provided. Analyse as a standalone document ")
                  .append("assuming a general software engineering/IT role.\n");
            }
            return sb.toString();
        }

        sb.append("Job Description");
        if (jobTitle != null) sb.append(" (").append(jobTitle).append(")");
        sb.append(":\n---\n");
        sb.append(truncate(jobDescription, 4000));
        sb.append("\n---\n");
        if (requiredSkills != null && !requiredSkills.isBlank()) {
            sb.append("Auto-detected required skills from JD: ").append(requiredSkills).append("\n");
        }
        return sb.toString();
    }

    /** Truncates text to avoid exceeding Gemini's context window. */
    private String truncate(String text, int maxChars) {
        if (text == null) return "";
        return text.length() > maxChars ? text.substring(0, maxChars) + "\n[truncated]" : text;
    }
}
