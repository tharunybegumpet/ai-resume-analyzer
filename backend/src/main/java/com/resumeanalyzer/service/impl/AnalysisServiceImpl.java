package com.resumeanalyzer.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyzer.dto.request.AnalysisRequest;
import com.resumeanalyzer.dto.response.AnalysisResponse;
import com.resumeanalyzer.entity.*;
import com.resumeanalyzer.enums.AnalysisStatus;
import com.resumeanalyzer.exception.ResourceNotFoundException;
import com.resumeanalyzer.repository.*;
import com.resumeanalyzer.service.AnalysisService;
import com.resumeanalyzer.util.GeminiClient;
import com.resumeanalyzer.util.GeminiPromptBuilder;
import com.resumeanalyzer.util.GeminiResponseParser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

/**
 * AnalysisServiceImpl — the full Gemini analysis pipeline.
 *
 * Pipeline:
 *  1. Load resume (and optional JD) from MySQL
 *  2. Build structured Gemini prompt
 *  3. Call Gemini API
 *  4. Parse response into ResumeAnalysis entity
 *  5. Persist ResumeAnalysis + AnalysisHistory + Skill records
 *  6. Return AnalysisResponse DTO
 *
 * Each JSON array field (skills, suggestions, etc.) stored as
 * a JSON string in MySQL is deserialized back to List<String>
 * before building the response DTO.
 */
@Service
@Transactional
public class AnalysisServiceImpl implements AnalysisService {

    private final ResumeRepository          resumeRepository;
    private final JobDescriptionRepository  jobDescriptionRepository;
    private final ResumeAnalysisRepository  analysisRepository;
    private final AnalysisHistoryRepository historyRepository;
    private final SkillRepository           skillRepository;
    private final UserRepository            userRepository;
    private final GeminiClient              geminiClient;
    private final GeminiPromptBuilder       promptBuilder;
    private final GeminiResponseParser      responseParser;
    private final ObjectMapper              objectMapper = new ObjectMapper();

    public AnalysisServiceImpl(ResumeRepository resumeRepository,
                               JobDescriptionRepository jobDescriptionRepository,
                               ResumeAnalysisRepository analysisRepository,
                               AnalysisHistoryRepository historyRepository,
                               SkillRepository skillRepository,
                               UserRepository userRepository,
                               GeminiClient geminiClient,
                               GeminiPromptBuilder promptBuilder,
                               GeminiResponseParser responseParser) {
        this.resumeRepository        = resumeRepository;
        this.jobDescriptionRepository = jobDescriptionRepository;
        this.analysisRepository      = analysisRepository;
        this.historyRepository       = historyRepository;
        this.skillRepository         = skillRepository;
        this.userRepository          = userRepository;
        this.geminiClient            = geminiClient;
        this.promptBuilder           = promptBuilder;
        this.responseParser          = responseParser;
    }

    // -----------------------------------------------------------------------
    // Analyze
    // -----------------------------------------------------------------------

    @Override
    public AnalysisResponse analyze(AnalysisRequest request, String userEmail) {
        User user = getUser(userEmail);

        // 1. Load resume — must belong to this user
        Resume resume = resumeRepository.findByIdAndUserId(request.getResumeId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resume not found with id: " + request.getResumeId()));

        // 2. Load optional Job Description
        JobDescription jd = null;
        if (request.getJobDescriptionId() != null) {
            jd = jobDescriptionRepository
                    .findByIdAndUserId(request.getJobDescriptionId(), user.getId())
                    .orElse(null);
        }

        // 3. Create analysis entity with PROCESSING status
        ResumeAnalysis analysis = new ResumeAnalysis();
        analysis.setResume(resume);
        analysis.setUser(user);
        analysis.setJobDescription(jd);
        analysis.setStatus(AnalysisStatus.PROCESSING);
        analysis = analysisRepository.save(analysis);

        try {
            // 4. Build prompt — pass targetJobRole alongside JD
            String prompt = promptBuilder.buildAnalysisPrompt(
                    resume.getExtractedText(),
                    jd != null ? jd.getContent()        : null,
                    jd != null ? jd.getRequiredSkills() : null,
                    jd != null ? jd.getTitle()          : null,
                    request.getTargetJobRole()
            );

            // 5. Call Gemini
            String rawText = geminiClient.generate(prompt);

            // 6. Parse into entity
            responseParser.parse(rawText, analysis);
            analysis.setStatus(AnalysisStatus.COMPLETED);
            analysis.setAnalyzedAt(LocalDateTime.now());
            analysis = analysisRepository.save(analysis);

            // 7. Persist lightweight history record
            persistHistory(analysis, resume, jd);

            // 8. Persist individual skill records (for admin stats)
            persistSkills(analysis, user);

        } catch (Exception e) {
            analysis.setStatus(AnalysisStatus.FAILED);
            analysis.setErrorMessage(e.getMessage());
            analysisRepository.save(analysis);
            throw new RuntimeException("Analysis failed: " + e.getMessage(), e);
        }

        return toResponse(analysis);
    }

    // -----------------------------------------------------------------------
    // Get by ID
    // -----------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public AnalysisResponse getById(Long id, String userEmail) {
        User user = getUser(userEmail);
        ResumeAnalysis analysis = analysisRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Analysis not found with id: " + id));
        return toResponse(analysis);
    }

    // -----------------------------------------------------------------------
    // Persist helpers
    // -----------------------------------------------------------------------

    private void persistHistory(ResumeAnalysis analysis, Resume resume, JobDescription jd) {
        AnalysisHistory history = new AnalysisHistory();
        history.setAnalysis(analysis);
        history.setUser(analysis.getUser());
        history.setResumeFileName(resume.getOriginalFileName());
        history.setJobTitle(jd != null ? jd.getTitle() : null);
        history.setAtsScore(analysis.getAtsScore());
        history.setSkillMatchPercentage(analysis.getSkillMatchPercentage());
        // Extract just the verdict (STRONG_HIRE | HIRE | CONSIDER | REJECT)
        String rec = analysis.getHiringRecommendation();
        if (rec != null && rec.length() > 0) {
            history.setHiringRecommendation(rec.split("\\s")[0]);
        }
        historyRepository.save(history);
    }

    private void persistSkills(ResumeAnalysis analysis, User user) {
        // Save identified skills
        parseJsonArray(analysis.getIdentifiedSkills()).forEach(skill ->
            skillRepository.save(new Skill(skill, "Technical", false, user, analysis))
        );
        // Save missing skills
        parseJsonArray(analysis.getMissingSkills()).forEach(skill ->
            skillRepository.save(new Skill(skill, "Technical", true, user, analysis))
        );
    }

    // -----------------------------------------------------------------------
    // Mapper
    // -----------------------------------------------------------------------

    private AnalysisResponse toResponse(ResumeAnalysis a) {
        AnalysisResponse r = new AnalysisResponse();
        r.setId(a.getId());
        r.setResumeId(a.getResume().getId());
        r.setResumeFileName(a.getResume().getOriginalFileName());
        r.setJobDescriptionId(a.getJobDescription() != null ? a.getJobDescription().getId() : null);
        r.setJobTitle(a.getJobDescription() != null ? a.getJobDescription().getTitle() : null);
        r.setStatus(a.getStatus());
        r.setAnalyzedAt(a.getAnalyzedAt());
        r.setProfessionalSummary(a.getProfessionalSummary());
        r.setCandidateStrengths(parseJsonArray(a.getCandidateStrengths()));
        r.setWeaknesses(parseJsonArray(a.getWeaknesses()));
        r.setIdentifiedSkills(parseJsonArray(a.getIdentifiedSkills()));
        r.setMissingSkills(parseJsonArray(a.getMissingSkills()));
        r.setAtsScore(a.getAtsScore());
        r.setSkillMatchPercentage(a.getSkillMatchPercentage());
        r.setTechnicalSkillAnalysis(a.getTechnicalSkillAnalysis());
        r.setSoftSkillAnalysis(a.getSoftSkillAnalysis());
        r.setProjectEvaluation(a.getProjectEvaluation());
        r.setEducationEvaluation(a.getEducationEvaluation());
        r.setExperienceEvaluation(a.getExperienceEvaluation());
        r.setKeywordMatch(parseJsonArray(a.getKeywordMatch()));
        r.setImprovementSuggestions(parseJsonArray(a.getImprovementSuggestions()));
        r.setMissingCertifications(parseJsonArray(a.getMissingCertifications()));
        r.setMissingTechnologies(parseJsonArray(a.getMissingTechnologies()));
        r.setRecommendedProjects(parseJsonArray(a.getRecommendedProjects()));
        r.setRecommendedCourses(parseJsonArray(a.getRecommendedCourses()));
        r.setHiringRecommendation(a.getHiringRecommendation());
        r.setImprovedSummary(a.getImprovedSummary());
        r.setImprovedSkillsSection(a.getImprovedSkillsSection());
        r.setSuggestedKeywords(parseJsonArray(a.getSuggestedKeywords()));
        r.setActionVerbs(parseJsonArray(a.getActionVerbs()));
        r.setGrammarSuggestions(a.getGrammarSuggestions());
        r.setErrorMessage(a.getErrorMessage());
        return r;
    }

    /** Safely parses a JSON array string like ["a","b"] to List<String>. */
    private List<String> parseJsonArray(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }
}
