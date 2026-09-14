package com.resumeanalyzer.util;

import com.resumeanalyzer.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

/**
 * FileStorageService — stores uploaded resume files on the local filesystem.
 *
 * Upload directory is configurable via app.upload.dir (default: "uploads").
 * Each file is renamed to a UUID to prevent collisions and path traversal.
 *
 * Supported MIME types:
 *  - application/pdf
 *  - application/vnd.openxmlformats-officedocument.wordprocessingml.document (DOCX)
 *
 * Max file size is enforced by Spring's multipart config (10 MB).
 */
@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadPath, e);
        }
    }

    /**
     * Validates and stores the uploaded file.
     *
     * @param file the multipart file from the HTTP request
     * @return the stored file name (UUID-based, used to retrieve the file later)
     */
    public String store(MultipartFile file) {
        validateFile(file);

        String extension     = getExtension(file.getOriginalFilename());
        String storedName    = UUID.randomUUID() + "." + extension;
        Path   targetPath    = uploadPath.resolve(storedName);

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }

        return storedName;
    }

    /**
     * Loads the stored file as a byte array (used for re-parsing if needed).
     */
    public byte[] load(String storedFileName) {
        Path filePath = uploadPath.resolve(storedFileName).normalize();
        // Prevent path traversal attacks
        if (!filePath.startsWith(uploadPath)) {
            throw new BadRequestException("Invalid file path.");
        }
        try {
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not read file: " + storedFileName, e);
        }
    }

    /**
     * Returns the absolute file path string for a stored file.
     */
    public String getFilePath(String storedFileName) {
        return uploadPath.resolve(storedFileName).normalize().toString();
    }

    /**
     * Deletes a stored file from disk.
     */
    public void delete(String storedFileName) {
        try {
            Path filePath = uploadPath.resolve(storedFileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log but don't throw — file may already be deleted
            System.err.println("Warning: Could not delete file: " + storedFileName);
        }
    }

    // ---- Validation ----

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file provided.");
        }

        String contentType = file.getContentType();
        if (contentType == null ||
            (!contentType.equals("application/pdf") &&
             !contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
            throw new BadRequestException(
                "Only PDF and DOCX files are supported. Received: " + contentType);
        }

        // 10 MB hard limit (Spring config enforces this too, belt-and-suspenders)
        if (file.getSize() > 10L * 1024 * 1024) {
            throw new BadRequestException("File size must not exceed 10 MB.");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new BadRequestException("File name is missing.");
        }

        String ext = getExtension(originalName).toLowerCase();
        if (!ext.equals("pdf") && !ext.equals("docx")) {
            throw new BadRequestException("File extension must be .pdf or .docx.");
        }
    }

    private String getExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) return "";
        return fileName.substring(fileName.lastIndexOf('.') + 1);
    }
}
