package com.resumeanalyzer.repository;

import com.resumeanalyzer.entity.JobDescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobDescriptionRepository extends JpaRepository<JobDescription, Long> {

    List<JobDescription> findByUserIdAndActiveTrueOrderByCreatedAtDesc(Long userId);

    Optional<JobDescription> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);
}
