package com.resumeanalyzer.dto.response;

import java.util.List;

/**
 * Dashboard statistics returned by GET /dashboard/stats
 * for the currently logged-in user.
 */
public class DashboardStatsResponse {

    private long    totalResumes;
    private long    totalAnalyses;
    private Double  averageAtsScore;
    private Integer highestAtsScore;

    // Recent 5 analyses for the "Recent Activity" table
    private List<HistoryItemResponse> recentAnalyses;

    // ATS score over time — used by the line chart
    // Each entry: { label: "Resume1.pdf", score: 78 }
    private List<ChartPoint> atsScoreHistory;

    public long getTotalResumes()                       { return totalResumes; }
    public void setTotalResumes(long totalResumes)      { this.totalResumes = totalResumes; }

    public long getTotalAnalyses()                      { return totalAnalyses; }
    public void setTotalAnalyses(long totalAnalyses)    { this.totalAnalyses = totalAnalyses; }

    public Double getAverageAtsScore()                  { return averageAtsScore; }
    public void setAverageAtsScore(Double averageAtsScore) { this.averageAtsScore = averageAtsScore; }

    public Integer getHighestAtsScore()                 { return highestAtsScore; }
    public void setHighestAtsScore(Integer highestAtsScore) { this.highestAtsScore = highestAtsScore; }

    public List<HistoryItemResponse> getRecentAnalyses()            { return recentAnalyses; }
    public void setRecentAnalyses(List<HistoryItemResponse> recentAnalyses) { this.recentAnalyses = recentAnalyses; }

    public List<ChartPoint> getAtsScoreHistory()        { return atsScoreHistory; }
    public void setAtsScoreHistory(List<ChartPoint> atsScoreHistory) { this.atsScoreHistory = atsScoreHistory; }

    // ---- Inner classes ----

    public static class ChartPoint {
        private String  label;
        private Integer score;
        public ChartPoint(String label, Integer score) { this.label = label; this.score = score; }
        public String  getLabel() { return label; }
        public Integer getScore() { return score; }
    }
}
