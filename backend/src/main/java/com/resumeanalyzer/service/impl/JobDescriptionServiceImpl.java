package com.resumeanalyzer.service.impl;

import com.resumeanalyzer.dto.request.JobDescriptionRequest;
import com.resumeanalyzer.dto.response.JobDescriptionResponse;
import com.resumeanalyzer.entity.JobDescription;
import com.resumeanalyzer.entity.User;
import com.resumeanalyzer.exception.ResourceNotFoundException;
import com.resumeanalyzer.repository.JobDescriptionRepository;
import com.resumeanalyzer.repository.UserRepository;
import com.resumeanalyzer.service.JobDescriptionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * JobDescriptionServiceImpl — handles all JD business logic.
 *
 * Key feature: auto-extracts required skills from the JD content
 * using a keyword-scanning approach so the Gemini prompt can
 * reference them directly for skill-match scoring.
 *
 * Skill extraction strategy:
 *  1. Look for a "Skills Required / Requirements" section
 *  2. Extract comma/bullet-delimited tech keywords
 *  3. Also scan for known tech keywords throughout the full text
 */
@Service
@Transactional
public class JobDescriptionServiceImpl implements JobDescriptionService {

    // Known tech keywords to scan for in JD text
    private static final List<String> TECH_KEYWORDS = Arrays.asList(
        "Java","Python","JavaScript","TypeScript","React","Angular","Vue",
        "Spring","Spring Boot","Node.js","Express","Django","Flask",
        "SQL","MySQL","PostgreSQL","MongoDB","Redis","Kafka",
        "Docker","Kubernetes","AWS","Azure","GCP","CI/CD","Git",
        "REST","GraphQL","Microservices","Agile","Scrum",
        "HTML","CSS","Bootstrap","Tailwind","Maven","Gradle",
        "JPA","Hibernate","JWT","OAuth","Linux","Jenkins"
    );

    private final JobDescriptionRepository jobDescriptionRepository;
    private final UserRepository           userRepository;

    public JobDescriptionServiceImpl(JobDescriptionRepository jobDescriptionRepository,
                                     UserRepository userRepository) {
        this.jobDescriptionRepository = jobDescriptionRepository;
        this.userRepository           = userRepository;
    }

    // ---- Save ----

    @Override
    public JobDescriptionResponse save(JobDescriptionRequest request, String userEmail) {
        User user = getUser(userEmail);

        JobDescription jd = new JobDescription();
        jd.setUser(user);
        jd.setTitle(request.getTitle());
        jd.setCompany(request.getCompany());
        jd.setContent(request.getContent());
        jd.setExperienceRequired(request.getExperienceRequired());
        jd.setRequiredSkills(extractSkills(request.getContent()));

        return toResponse(jobDescriptionRepository.save(jd));
    }

    // ---- List ----

    @Override
    @Transactional(readOnly = true)
    public List<JobDescriptionResponse> getAll(String userEmail) {
        User user = getUser(userEmail);
        return jobDescriptionRepository
                .findByUserIdAndActiveTrueOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ---- Get by ID ----

    @Override
    @Transactional(readOnly = true)
    public JobDescriptionResponse getById(Long id, String userEmail) {
        User user = getUser(userEmail);
        return toResponse(findOwned(id, user.getId()));
    }

    // ---- Update ----

    @Override
    public JobDescriptionResponse update(Long id, JobDescriptionRequest request, String userEmail) {
        User user = getUser(userEmail);
        JobDescription jd = findOwned(id, user.getId());

        if (request.getTitle()   != null) jd.setTitle(request.getTitle());
        if (request.getCompany() != null) jd.setCompany(request.getCompany());
        if (request.getContent() != null) {
            jd.setContent(request.getContent());
            jd.setRequiredSkills(extractSkills(request.getContent()));
        }
        if (request.getExperienceRequired() != null)
            jd.setExperienceRequired(request.getExperienceRequired());

        return toResponse(jobDescriptionRepository.save(jd));
    }

    // ---- Delete (soft) ----

    @Override
    public void delete(Long id, String userEmail) {
        User user = getUser(userEmail);
        JobDescription jd = findOwned(id, user.getId());
        jd.setActive(false);
        jobDescriptionRepository.save(jd);
    }

    // ---- Helpers ----

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private JobDescription findOwned(Long id, Long userId) {
        return jobDescriptionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Job description not found with id: " + id));
    }

    /**
     * Scans JD content for known tech keywords.
     * Returns a comma-separated string (stored in DB, sent to Gemini prompt).
     */
    private String extractSkills(String content) {
        if (content == null || content.isBlank()) return null;
        String lower = content.toLowerCase();
        List<String> found = TECH_KEYWORDS.stream()
                .filter(kw -> lower.contains(kw.toLowerCase()))
                .collect(Collectors.toList());
        return found.isEmpty() ? null : String.join(", ", found);
    }

    // ---- Mapper ----

    private JobDescriptionResponse toResponse(JobDescription jd) {
        JobDescriptionResponse r = new JobDescriptionResponse();
        r.setId(jd.getId());
        r.setTitle(jd.getTitle());
        r.setCompany(jd.getCompany());
        r.setContent(jd.getContent());
        r.setRequiredSkills(jd.getRequiredSkills());
        r.setExperienceRequired(jd.getExperienceRequired());
        r.setCreatedAt(jd.getCreatedAt());
        r.setUpdatedAt(jd.getUpdatedAt());
        r.setTotalAnalyses(jd.getAnalyses().size());
        return r;
    }
}
