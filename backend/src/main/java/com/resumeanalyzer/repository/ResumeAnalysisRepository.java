package com.resumeanalyzer.repository;

import com.resumeanalyzer.entity.ResumeAnalysis;
import com.resumeanalyzer.enums.AnalysisStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis, Long> {

    List<ResumeAnalysis> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, AnalysisStatus status);

    Optional<ResumeAnalysis> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT AVG(a.atsScore) FROM ResumeAnalysis a WHERE a.user.id = :userId AND a.atsScore IS NOT NULL")
    Double findAvgAtsScoreByUserId(@Param("userId") Long userId);

    @Query("SELECT MAX(a.atsScore) FROM ResumeAnalysis a WHERE a.user.id = :userId AND a.atsScore IS NOT NULL")
    Integer findMaxAtsScoreByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(a.atsScore) FROM ResumeAnalysis a WHERE a.atsScore IS NOT NULL")
    Double findGlobalAvgAtsScore();

    long countByUserId(Long userId);

    long countByStatus(AnalysisStatus status);
}
