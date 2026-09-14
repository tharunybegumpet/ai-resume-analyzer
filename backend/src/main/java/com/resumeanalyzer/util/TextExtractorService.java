package com.resumeanalyzer.util;

import com.resumeanalyzer.enums.FileType;
import com.resumeanalyzer.exception.BadRequestException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.encryption.AccessPermission;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

/**
 * TextExtractorService — extracts plain text from PDF and DOCX files.
 *
 * PDF  → Apache PDFBox 3.x  (Loader.loadPDF, PDFTextStripper)
 * DOCX → Apache POI 5.x    (XWPFDocument, XWPFParagraph)
 *
 * Both extractors:
 *  - Sort text by position for natural reading order
 *  - Handle encrypted/protected files gracefully
 *  - Validate that extracted text isn't empty (catches scanned images)
 */
@Service
public class TextExtractorService {

    /**
     * Auto-detects file type and extracts text.
     *
     * @param file     the uploaded MultipartFile
     * @param fileType PDF or DOCX
     * @return trimmed plain text content
     */
    public String extract(MultipartFile file, FileType fileType) {
        try {
            return switch (fileType) {
                case PDF  -> extractFromPdf(file);
                case DOCX -> extractFromDocx(file);
            };
        } catch (BadRequestException e) {
            throw e;
        } catch (IOException e) {
            throw new RuntimeException("Failed to extract text from file: " + e.getMessage(), e);
        }
    }

    // ---- PDF ----

    private String extractFromPdf(MultipartFile file) throws IOException {
        byte[] bytes = file.getInputStream().readAllBytes();

        try (PDDocument document = Loader.loadPDF(bytes)) {
            AccessPermission ap = document.getCurrentAccessPermission();
            if (!ap.canExtractContent()) {
                throw new BadRequestException(
                    "This PDF is encrypted and does not allow text extraction.");
            }

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);   // natural top-to-bottom, left-to-right order

            String text = stripper.getText(document);
            return validateAndReturn(text, "PDF");
        }
    }

    // ---- DOCX ----

    private String extractFromDocx(MultipartFile file) throws IOException {
        try (InputStream is = file.getInputStream();
             XWPFDocument document = new XWPFDocument(is)) {

            StringBuilder sb = new StringBuilder();

            // Iterate all paragraphs (body text)
            for (XWPFParagraph para : document.getParagraphs()) {
                String text = para.getText();
                if (text != null && !text.isBlank()) {
                    sb.append(text).append("\n");
                }
            }

            // Also extract text from tables (skills tables, etc.)
            document.getTables().forEach(table ->
                table.getRows().forEach(row ->
                    row.getTableCells().forEach(cell -> {
                        String cellText = cell.getText();
                        if (cellText != null && !cellText.isBlank()) {
                            sb.append(cellText).append(" ");
                        }
                    })
                )
            );

            return validateAndReturn(sb.toString(), "DOCX");
        }
    }

    // ---- Helpers ----

    private String validateAndReturn(String text, String type) {
        if (text == null || text.isBlank()) {
            throw new BadRequestException(
                "No readable text found in the " + type + " file. " +
                "If this is a scanned document, please use a text-based file.");
        }
        return text.trim();
    }
}
