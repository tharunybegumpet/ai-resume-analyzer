package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.request.JobDescriptionRequest;
import com.resumeanalyzer.dto.response.JobDescriptionResponse;

import java.util.List;

public interface JobDescriptionService {
    JobDescriptionResponse        save(JobDescriptionRequest request, String userEmail);
    List<JobDescriptionResponse>  getAll(String userEmail);
    JobDescriptionResponse        getById(Long id, String userEmail);
    JobDescriptionResponse        update(Long id, JobDescriptionRequest request, String userEmail);
    void                          delete(Long id, String userEmail);
}
