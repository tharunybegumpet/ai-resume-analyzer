package com.resumeanalyzer.service.impl;

import com.resumeanalyzer.dto.response.AdminStatsResponse;
import com.resumeanalyzer.dto.response.UserProfileResponse;
import com.resumeanalyzer.repository.*;
import com.resumeanalyzer.service.AdminService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private final UserRepository            userRepository;
    private final ResumeRepository          resumeRepository;
    private final ResumeAnalysisRepository  analysisRepository;
    private final SkillRepository           skillRepository;

    public AdminServiceImpl(UserRepository userRepository,
                            ResumeRepository resumeRepository,
                            ResumeAnalysisRepository analysisRepository,
                            SkillRepository skillRepository) {
        this.userRepository     = userRepository;
        this.resumeRepository   = resumeRepository;
        this.analysisRepository = analysisRepository;
        this.skillRepository    = skillRepository;
    }

    @Override
    public AdminStatsResponse getStats() {
        AdminStatsResponse s = new AdminStatsResponse();
        s.setTotalUsers(userRepository.countActiveUsers());
        s.setTotalResumes(resumeRepository.countAllActive());
        s.setTotalAnalyses(analysisRepository.count());
        s.setGlobalAvgAtsScore(analysisRepository.findGlobalAvgAtsScore());

        // Top 10 skills
        s.setTopSkills(skillRepository.findTopSkills().stream()
                .limit(10)
                .map(row -> Map.<String,Object>of("skill", row[0], "count", row[1]))
                .collect(Collectors.toList()));

        // Top 10 missing skills
        s.setTopMissingSkills(skillRepository.findTopMissingSkills().stream()
                .limit(10)
                .map(row -> Map.<String,Object>of("skill", row[0], "count", row[1]))
                .collect(Collectors.toList()));

        // Recent 5 users
        s.setRecentUsers(userRepository.findAll(PageRequest.of(0, 5))
                .stream()
                .map(u -> {
                    UserProfileResponse r = new UserProfileResponse();
                    r.setId(u.getId());
                    r.setFullName(u.getFullName());
                    r.setEmail(u.getEmail());
                    r.setCreatedAt(u.getCreatedAt());
                    r.setRoles(u.getRoles().stream()
                            .map(Enum::name).collect(java.util.stream.Collectors.toSet()));
                    r.setTotalResumes(resumeRepository.countByUserId(u.getId()));
                    r.setTotalAnalyses(analysisRepository.countByUserId(u.getId()));
                    return r;
                })
                .collect(Collectors.toList()));
        return s;
    }

    @Override
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream().map(u -> {
            UserProfileResponse r = new UserProfileResponse();
            r.setId(u.getId());
            r.setFullName(u.getFullName());
            r.setEmail(u.getEmail());
            r.setCreatedAt(u.getCreatedAt());
            r.setLastLoginAt(u.getLastLoginAt());
            r.setRoles(u.getRoles().stream().map(Enum::name).collect(Collectors.toSet()));
            r.setTotalResumes(resumeRepository.countByUserId(u.getId()));
            r.setTotalAnalyses(analysisRepository.countByUserId(u.getId()));
            return r;
        }).collect(Collectors.toList());
    }
}
