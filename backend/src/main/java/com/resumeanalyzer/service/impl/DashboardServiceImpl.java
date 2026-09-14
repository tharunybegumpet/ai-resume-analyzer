package com.resumeanalyzer.service.impl;

import com.resumeanalyzer.dto.response.DashboardStatsResponse;
import com.resumeanalyzer.dto.response.HistoryItemResponse;
import com.resumeanalyzer.entity.AnalysisHistory;
import com.resumeanalyzer.entity.User;
import com.resumeanalyzer.exception.ResourceNotFoundException;
import com.resumeanalyzer.repository.*;
import com.resumeanalyzer.service.DashboardService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository            userRepository;
    private final ResumeRepository          resumeRepository;
    private final ResumeAnalysisRepository  analysisRepository;
    private final AnalysisHistoryRepository historyRepository;

    public DashboardServiceImpl(UserRepository userRepository,
                                ResumeRepository resumeRepository,
                                ResumeAnalysisRepository analysisRepository,
                                AnalysisHistoryRepository historyRepository) {
        this.userRepository     = userRepository;
        this.resumeRepository   = resumeRepository;
        this.analysisRepository = analysisRepository;
        this.historyRepository  = historyRepository;
    }

    @Override
    public DashboardStatsResponse getUserStats(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        Long uid = user.getId();

        DashboardStatsResponse stats = new DashboardStatsResponse();
        stats.setTotalResumes(resumeRepository.countByUserId(uid));
        stats.setTotalAnalyses(analysisRepository.countByUserId(uid));
        stats.setAverageAtsScore(analysisRepository.findAvgAtsScoreByUserId(uid));
        stats.setHighestAtsScore(analysisRepository.findMaxAtsScoreByUserId(uid));

        // Recent 5 analyses
        List<AnalysisHistory> recent = historyRepository
                .findRecentByUserId(uid, PageRequest.of(0, 5));
        stats.setRecentAnalyses(recent.stream().map(this::toHistoryItem).collect(Collectors.toList()));

        // ATS score history for line chart (last 10)
        List<AnalysisHistory> all = historyRepository
                .findRecentByUserId(uid, PageRequest.of(0, 10));
        List<DashboardStatsResponse.ChartPoint> chartPoints = all.stream()
                .filter(h -> h.getAtsScore() != null)
                .map(h -> new DashboardStatsResponse.ChartPoint(
                        h.getResumeFileName(), h.getAtsScore()))
                .collect(Collectors.toList());
        java.util.Collections.reverse(chartPoints);   // chronological order
        stats.setAtsScoreHistory(chartPoints);

        return stats;
    }

    private HistoryItemResponse toHistoryItem(AnalysisHistory h) {
        HistoryItemResponse r = new HistoryItemResponse();
        r.setId(h.getId());
        r.setAnalysisId(h.getAnalysis().getId());
        r.setResumeFileName(h.getResumeFileName());
        r.setJobTitle(h.getJobTitle());
        r.setAtsScore(h.getAtsScore());
        r.setSkillMatchPercentage(h.getSkillMatchPercentage());
        r.setHiringRecommendation(h.getHiringRecommendation());
        r.setCreatedAt(h.getCreatedAt());
        return r;
    }
}
