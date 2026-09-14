package com.resumeanalyzer.repository;

import com.resumeanalyzer.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    List<Recommendation> findByAnalysisIdOrderByPriorityAsc(Long analysisId);

    List<Recommendation> findByAnalysisIdAndCategory(Long analysisId, String category);
}
