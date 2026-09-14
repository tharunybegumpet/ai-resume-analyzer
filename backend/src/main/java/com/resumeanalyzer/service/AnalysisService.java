package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.request.AnalysisRequest;
import com.resumeanalyzer.dto.response.AnalysisResponse;

public interface AnalysisService {
    AnalysisResponse analyze(AnalysisRequest request, String userEmail);
    AnalysisResponse getById(Long id, String userEmail);
}
