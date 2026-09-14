package com.resumeanalyzer.util;

import com.resumeanalyzer.entity.Resume;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * ResumeParserService — extracts structured fields from raw resume text
 * using regex patterns.
 *
 * Extracted fields:
 *  - Email        → standard email regex
 *  - Phone        → Indian + international formats
 *  - LinkedIn URL → linkedin.com/in/...
 *  - GitHub URL   → github.com/...
 *  - Name         → first non-empty, non-header line heuristic
 *
 * Section extraction (Education, Skills, Experience, Projects, etc.)
 * uses section-header detection to slice the text into blocks.
 *
 * Note: For best accuracy on name, Gemini's analysis result
 * (Feature 6) can override these regex-parsed values.
 */
@Service
public class ResumeParserService {

    // ---- Regex Patterns ----

    private static final Pattern EMAIL_PATTERN =
        Pattern.compile("[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}");

    private static final Pattern PHONE_PATTERN =
        Pattern.compile("(\\+?\\d[\\d\\s\\-().]{7,15}\\d)");

    private static final Pattern LINKEDIN_PATTERN =
        Pattern.compile("(?i)https?://(www\\.)?linkedin\\.com/in/[a-zA-Z0-9\\-_%]+/?");

    private static final Pattern GITHUB_PATTERN =
        Pattern.compile("(?i)https?://(www\\.)?github\\.com/[a-zA-Z0-9\\-_%]+/?");

    // Section headers (case-insensitive)
    private static final Pattern SKILLS_HEADER =
        Pattern.compile("(?i)^(technical\\s+)?skills?\\s*:?\\s*$", Pattern.MULTILINE);

    private static final Pattern EDUCATION_HEADER =
        Pattern.compile("(?i)^(education|academic\\s+background|qualifications?)\\s*:?\\s*$", Pattern.MULTILINE);

    private static final Pattern EXPERIENCE_HEADER =
        Pattern.compile("(?i)^(work\\s+)?(experience|employment|history)\\s*:?\\s*$", Pattern.MULTILINE);

    private static final Pattern PROJECTS_HEADER =
        Pattern.compile("(?i)^(projects?|personal\\s+projects?)\\s*:?\\s*$", Pattern.MULTILINE);

    private static final Pattern CERTIFICATIONS_HEADER =
        Pattern.compile("(?i)^(certifications?|certificates?)\\s*:?\\s*$", Pattern.MULTILINE);

    private static final Pattern INTERNSHIPS_HEADER =
        Pattern.compile("(?i)^(internships?|trainings?)\\s*:?\\s*$", Pattern.MULTILINE);

    private static final Pattern ACHIEVEMENTS_HEADER =
        Pattern.compile("(?i)^(achievements?|awards?|honours?)\\s*:?\\s*$", Pattern.MULTILINE);

    private static final Pattern LANGUAGES_HEADER =
        Pattern.compile("(?i)^(languages?|spoken\\s+languages?)\\s*:?\\s*$", Pattern.MULTILINE);

    /**
     * Parses all fields from the extracted text and populates the Resume entity.
     * Does NOT save — caller is responsible for persisting.
     */
    public void parse(Resume resume, String text) {
        resume.setParsedEmail(extractFirst(EMAIL_PATTERN, text));
        resume.setParsedPhone(extractPhone(text));
        resume.setParsedLinkedin(extractFirst(LINKEDIN_PATTERN, text));
        resume.setParsedGithub(extractFirst(GITHUB_PATTERN, text));
        resume.setParsedName(extractName(text));
        resume.setParsedSkills(extractSection(text, SKILLS_HEADER));
        resume.setParsedEducation(extractSection(text, EDUCATION_HEADER));
        resume.setParsedExperience(extractSection(text, EXPERIENCE_HEADER));
        resume.setParsedProjects(extractSection(text, PROJECTS_HEADER));
        resume.setParsedCertifications(extractSection(text, CERTIFICATIONS_HEADER));
        resume.setParsedInternships(extractSection(text, INTERNSHIPS_HEADER));
        resume.setParsedAchievements(extractSection(text, ACHIEVEMENTS_HEADER));
        resume.setParsedLanguages(extractSection(text, LANGUAGES_HEADER));
    }

    // ---- Helpers ----

    private String extractFirst(Pattern pattern, String text) {
        Matcher m = pattern.matcher(text);
        return m.find() ? m.group().trim() : null;
    }

    private String extractPhone(String text) {
        Matcher m = PHONE_PATTERN.matcher(text);
        while (m.find()) {
            String candidate = m.group().replaceAll("[\\s\\-().]", "");
            // Filter out years (4-digit numbers like 2020) and short sequences
            if (candidate.length() >= 8 && !candidate.matches("\\d{4}")) {
                return m.group().trim();
            }
        }
        return null;
    }

    /**
     * Heuristic name extraction:
     * The candidate name is usually one of the first 3 non-empty lines,
     * is short (< 50 chars), contains only letters and spaces,
     * and doesn't look like a header keyword.
     */
    private String extractName(String text) {
        String[] lines = text.split("\\r?\\n");
        int checked = 0;
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;
            checked++;
            if (checked > 5) break;

            // Skip lines that look like headers, emails, URLs, or phone numbers
            if (trimmed.contains("@") || trimmed.contains("http")
                    || trimmed.matches(".*\\d{4,}.*")
                    || trimmed.length() > 50
                    || trimmed.length() < 3) continue;

            // Must look like a name (only letters, spaces, dots, hyphens)
            if (trimmed.matches("[A-Za-z][A-Za-z .\\-']{1,48}[A-Za-z]")) {
                return trimmed;
            }
        }
        return null;
    }

    /**
     * Extracts the content under a section header.
     * Stops at the next all-caps or known-header line.
     */
    private String extractSection(String text, Pattern headerPattern) {
        Matcher headerMatcher = headerPattern.matcher(text);
        if (!headerMatcher.find()) return null;

        int start = headerMatcher.end();
        String rest = text.substring(start);

        // Stop at the next section (line that looks like a new header)
        Pattern nextSection = Pattern.compile(
            "(?m)^[A-Z][A-Z\\s&/]{3,}:?\\s*$");
        Matcher next = nextSection.matcher(rest);

        String section = next.find() ? rest.substring(0, next.start()) : rest;
        String result  = section.trim();
        return result.isEmpty() ? null : result;
    }
}
