package com.resumeanalyzer.service.impl;

import com.resumeanalyzer.dto.response.HistoryItemResponse;
import com.resumeanalyzer.entity.AnalysisHistory;
import com.resumeanalyzer.entity.User;
import com.resumeanalyzer.exception.ResourceNotFoundException;
import com.resumeanalyzer.exception.UnauthorizedException;
import com.resumeanalyzer.repository.AnalysisHistoryRepository;
import com.resumeanalyzer.repository.UserRepository;
import com.resumeanalyzer.service.HistoryService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class HistoryServiceImpl implements HistoryService {

    private final AnalysisHistoryRepository historyRepository;
    private final UserRepository userRepository;

    public HistoryServiceImpl(AnalysisHistoryRepository historyRepository,
                              UserRepository userRepository) {
        this.historyRepository = historyRepository;
        this.userRepository    = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<HistoryItemResponse> getHistory(String userEmail, String sortBy) {
        User user = getUser(userEmail);
        List<AnalysisHistory> list;
        if ("score".equalsIgnoreCase(sortBy)) {
            list = historyRepository.findByUserIdOrderByAtsScoreDesc(user.getId());
        } else {
            list = historyRepository
                    .findRecentByUserId(user.getId(), PageRequest.of(0, 100));
        }
        return list.stream().map(this::toItem).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HistoryItemResponse> search(String userEmail, String query) {
        User user = getUser(userEmail);
        return historyRepository.searchByUserId(user.getId(), query)
                .stream().map(this::toItem).collect(Collectors.toList());
    }

    @Override
    public void delete(Long historyId, String userEmail) {
        User user = getUser(userEmail);
        AnalysisHistory history = historyRepository.findById(historyId)
                .orElseThrow(() -> new ResourceNotFoundException("History record not found."));
        if (!history.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You don't have permission to delete this record.");
        }
        historyRepository.delete(history);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private HistoryItemResponse toItem(AnalysisHistory h) {
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
