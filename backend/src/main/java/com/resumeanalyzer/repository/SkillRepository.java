package com.resumeanalyzer.repository;

import com.resumeanalyzer.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {

    // Top skills across all users (for admin dashboard)
    @Query("""
        SELECT s.skillName, COUNT(s) as cnt
        FROM Skill s
        WHERE s.missing = false
        GROUP BY s.skillName
        ORDER BY cnt DESC
        """)
    List<Object[]> findTopSkills();

    // Most common missing skills (for admin dashboard)
    @Query("""
        SELECT s.skillName, COUNT(s) as cnt
        FROM Skill s
        WHERE s.missing = true
        GROUP BY s.skillName
        ORDER BY cnt DESC
        """)
    List<Object[]> findTopMissingSkills();
}
