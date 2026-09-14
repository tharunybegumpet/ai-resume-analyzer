package com.resumeanalyzer.service.impl;

import com.resumeanalyzer.dto.response.ResumeResponse;
import com.resumeanalyzer.dto.response.ResumeSummaryResponse;
import com.resumeanalyzer.entity.Resume;
import com.resumeanalyzer.entity.User;
import com.resumeanalyzer.enums.FileType;
import com.resumeanalyzer.exception.ResourceNotFoundException;
import com.resumeanalyzer.exception.UnauthorizedException;
import com.resumeanalyzer.repository.ResumeRepository;
import com.resumeanalyzer.repository.UserRepository;
import com.resumeanalyzer.service.ResumeService;
import com.resumeanalyzer.util.FileStorageService;
import com.resumeanalyzer.util.ResumeParserService;
import com.resumeanalyzer.util.TextExtractorService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ResumeServiceImpl — orchestrates the upload pipeline:
 *
 *  1. Load user from DB
 *  2. Store file to disk (FileStorageService)
 *  3. Extract text (TextExtractorService — PDFBox or POI)
 *  4. Parse fields (ResumeParserService — regex)
 *  5. Save Resume entity to MySQL
 *  6. Return full ResumeResponse DTO
 */
@Service
@Transactional
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository    resumeRepository;
    private final UserRepository      userRepository;
    private final FileStorageService  fileStorageService;
    private final TextExtractorService textExtractorService;
    private final ResumeParserService  resumeParserService;

    public ResumeServiceImpl(ResumeRepository resumeRepository,
                             UserRepository userRepository,
                             FileStorageService fileStorageService,
                             TextExtractorService textExtractorService,
                             ResumeParserService resumeParserService) {
        this.resumeRepository     = resumeRepository;
        this.userRepository       = userRepository;
        this.fileStorageService   = fileStorageService;
        this.textExtractorService = textExtractorService;
        this.resumeParserService  = resumeParserService;
    }

    // ---- Upload ----

    @Override
    public ResumeResponse upload(MultipartFile file, String userEmail) {
        User user = getUser(userEmail);

        // Determine file type
        FileType fileType = resolveFileType(file.getContentType());

        // 1. Store file to disk → get UUID-based stored name
        String storedName = fileStorageService.store(file);

        // 2. Extract text from PDF/DOCX
        String extractedText = textExtractorService.extract(file, fileType);

        // 3. Build entity
        Resume resume = new Resume();
        resume.setUser(user);
        resume.setOriginalFileName(file.getOriginalFilename());
        resume.setStoredFileName(storedName);
        resume.setFilePath(fileStorageService.getFilePath(storedName));
        resume.setFileType(fileType);
        resume.setFileSizeBytes(file.getSize());
        resume.setExtractedText(extractedText);

        // 4. Parse fields (regex)
        resumeParserService.parse(resume, extractedText);

        // 5. Persist
        Resume saved = resumeRepository.save(resume);

        System.out.printf("[ResumeService] Uploaded '%s' for user '%s' — %d chars extracted%n",
                file.getOriginalFilename(), userEmail, extractedText.length());

        return toFullResponse(saved);
    }

    // ---- List ----

    @Override
    @Transactional(readOnly = true)
    public List<ResumeSummaryResponse> getMyResumes(String userEmail) {
        User user = getUser(userEmail);
        return resumeRepository.findActiveByUserId(user.getId())
                .stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    // ---- Get by ID ----

    @Override
    @Transactional(readOnly = true)
    public ResumeResponse getById(Long resumeId, String userEmail) {
        User   user   = getUser(userEmail);
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resume not found with id: " + resumeId));
        return toFullResponse(resume);
    }

    // ---- Delete (soft delete) ----

    @Override
    public void delete(Long resumeId, String userEmail) {
        User   user   = getUser(userEmail);
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resume not found with id: " + resumeId));
        resume.setActive(false);
        resumeRepository.save(resume);
    }

    // ---- Helpers ----

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private FileType resolveFileType(String contentType) {
        if ("application/pdf".equals(contentType)) return FileType.PDF;
        if ("application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                .equals(contentType)) return FileType.DOCX;
        throw new com.resumeanalyzer.exception.BadRequestException(
                "Unsupported file type: " + contentType);
    }

    // ---- Mappers ----

    private ResumeResponse toFullResponse(Resume r) {
        ResumeResponse resp = new ResumeResponse();
        resp.setId(r.getId());
        resp.setOriginalFileName(r.getOriginalFileName());
        resp.setFileType(r.getFileType());
        resp.setFileSizeBytes(r.getFileSizeBytes());
        resp.setUploadedAt(r.getUploadedAt());
        resp.setParsedName(r.getParsedName());
        resp.setParsedEmail(r.getParsedEmail());
        resp.setParsedPhone(r.getParsedPhone());
        resp.setParsedLinkedin(r.getParsedLinkedin());
        resp.setParsedGithub(r.getParsedGithub());
        resp.setParsedSummary(r.getParsedSummary());
        resp.setParsedSkills(r.getParsedSkills());
        resp.setParsedEducation(r.getParsedEducation());
        resp.setParsedExperience(r.getParsedExperience());
        resp.setParsedProjects(r.getParsedProjects());
        resp.setParsedCertifications(r.getParsedCertifications());
        resp.setParsedLanguages(r.getParsedLanguages());
        resp.setParsedAchievements(r.getParsedAchievements());
        resp.setParsedInternships(r.getParsedInternships());
        resp.setTotalAnalyses(r.getAnalyses().size());
        return resp;
    }

    private ResumeSummaryResponse toSummaryResponse(Resume r) {
        ResumeSummaryResponse resp = new ResumeSummaryResponse();
        resp.setId(r.getId());
        resp.setOriginalFileName(r.getOriginalFileName());
        resp.setFileType(r.getFileType());
        resp.setFileSizeBytes(r.getFileSizeBytes());
        resp.setParsedName(r.getParsedName());
        resp.setParsedEmail(r.getParsedEmail());
        resp.setUploadedAt(r.getUploadedAt());
        resp.setTotalAnalyses(r.getAnalyses().size());
        return resp;
    }
}
