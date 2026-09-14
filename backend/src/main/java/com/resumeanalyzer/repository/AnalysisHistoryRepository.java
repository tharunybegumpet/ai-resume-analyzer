package com.resumeanalyzer.repository;

import com.resumeanalyzer.entity.AnalysisHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnalysisHistoryRepository extends JpaRepository<AnalysisHistory, Long> {

    // Paginated history for the history page
    Page<AnalysisHistory> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    // Search by file name or job title
    @Query("""
        SELECT h FROM AnalysisHistory h
        WHERE h.user.id = :userId
          AND (LOWER(h.resumeFileName) LIKE LOWER(CONCAT('%',:q,'%'))
            OR LOWER(h.jobTitle) LIKE LOWER(CONCAT('%',:q,'%')))
        ORDER BY h.createdAt DESC
        """)
    List<AnalysisHistory> searchByUserId(@Param("userId") Long userId, @Param("q") String query);

    // Sort by ATS score
    List<AnalysisHistory> findByUserIdOrderByAtsScoreDesc(Long userId);

    Optional<AnalysisHistory> findByAnalysisIdAndUserId(Long analysisId, Long userId);

    // For dashboard — last N analyses
    @Query("SELECT h FROM AnalysisHistory h WHERE h.user.id = :userId ORDER BY h.createdAt DESC")
    List<AnalysisHistory> findRecentByUserId(@Param("userId") Long userId, Pageable pageable);

    long countByUserId(Long userId);
}
