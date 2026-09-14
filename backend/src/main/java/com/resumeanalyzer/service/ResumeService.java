package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.response.ResumeResponse;
import com.resumeanalyzer.dto.response.ResumeSummaryResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ResumeService {
    ResumeResponse      upload(MultipartFile file, String userEmail);
    List<ResumeSummaryResponse> getMyResumes(String userEmail);
    ResumeResponse      getById(Long resumeId, String userEmail);
    void                delete(Long resumeId, String userEmail);
}
