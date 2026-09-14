package com.resumeanalyzer.repository;

import com.resumeanalyzer.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {

    List<Resume> findByUserIdAndActiveTrueOrderByUploadedAtDesc(Long userId);

    Optional<Resume> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    @Query("SELECT COUNT(r) FROM Resume r WHERE r.active = true")
    long countAllActive();

    @Query("SELECT r FROM Resume r WHERE r.user.id = :userId AND r.active = true ORDER BY r.uploadedAt DESC")
    List<Resume> findActiveByUserId(@Param("userId") Long userId);
}
