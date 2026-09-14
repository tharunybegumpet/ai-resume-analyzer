package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.response.HistoryItemResponse;
import java.util.List;

public interface HistoryService {
    List<HistoryItemResponse> getHistory(String userEmail, String sortBy);
    List<HistoryItemResponse> search(String userEmail, String query);
    void delete(Long historyId, String userEmail);
}
