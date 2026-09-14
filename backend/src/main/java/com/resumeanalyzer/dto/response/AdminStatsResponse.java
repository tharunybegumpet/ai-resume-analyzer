package com.resumeanalyzer.dto.response;

import java.util.List;
import java.util.Map;

public class AdminStatsResponse {
    private long   totalUsers;
    private long   totalResumes;
    private long   totalAnalyses;
    private Double globalAvgAtsScore;
    private List<Map<String,Object>> topSkills;
    private List<Map<String,Object>> topMissingSkills;
    private List<UserProfileResponse> recentUsers;

    public long   getTotalUsers()                          { return totalUsers; }
    public void   setTotalUsers(long v)                    { this.totalUsers = v; }
    public long   getTotalResumes()                        { return totalResumes; }
    public void   setTotalResumes(long v)                  { this.totalResumes = v; }
    public long   getTotalAnalyses()                       { return totalAnalyses; }
    public void   setTotalAnalyses(long v)                 { this.totalAnalyses = v; }
    public Double getGlobalAvgAtsScore()                   { return globalAvgAtsScore; }
    public void   setGlobalAvgAtsScore(Double v)           { this.globalAvgAtsScore = v; }
    public List<Map<String,Object>> getTopSkills()         { return topSkills; }
    public void   setTopSkills(List<Map<String,Object>> v) { this.topSkills = v; }
    public List<Map<String,Object>> getTopMissingSkills()  { return topMissingSkills; }
    public void   setTopMissingSkills(List<Map<String,Object>> v){ this.topMissingSkills = v; }
    public List<UserProfileResponse> getRecentUsers()      { return recentUsers; }
    public void   setRecentUsers(List<UserProfileResponse> v){ this.recentUsers = v; }
}
