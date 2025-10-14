package com.jobportal.services.impl;

import com.jobportal.dtos.resources.ResumeFileResource;
import com.jobportal.entities.Resume;
import com.jobportal.entities.ResumeFile;
import com.jobportal.mappers.ResumeFileMapper;
import com.jobportal.repositories.ResumeFileRepository;
import com.jobportal.repositories.ResumeRepository;
import com.jobportal.services.interfaces.ResumeFileServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResumeFileService implements ResumeFileServiceInterface {

    private final ResumeRepository resumeRepository;
    private final ResumeFileRepository resumeFileRepository;
    private final ResumeFileMapper resumeFileMapper;

    @Transactional
    public ResumeFileResource upload(Long userId, Long resumeId, MultipartFile file, String fileTypeParam) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("File rỗng");

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new EntityNotFoundException("Resume không tồn tại"));
        if (!resume.getUser().getId().equals(userId))
            throw new IllegalArgumentException("Không được phép upload file cho resume của người khác");

        Path uploadDir = Paths.get("/app/uploads", "resumes").toAbsolutePath().normalize();
        try { Files.createDirectories(uploadDir); }
        catch (IOException e) { throw new RuntimeException("Không tạo được thư mục lưu file", e); }

        String original = StringUtils.getFilename(file.getOriginalFilename());
        String ext = (original != null && original.contains(".")) ? original.substring(original.lastIndexOf('.')) : "";
        if (!ext.toLowerCase().matches("\\.(pdf|doc|docx|png|jpg|jpeg|webp)$")) {
            throw new IllegalArgumentException("Định dạng không hợp lệ (chỉ PDF/DOC/DOCX/Ảnh)");
        }

        String filename = UUID.randomUUID() + ext.toLowerCase();
        Path target = uploadDir.resolve(filename).normalize();
        try { Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING); }
        catch (IOException e) { throw new RuntimeException("Lưu file thất bại", e); }

        String url = "/resumes/" + filename;

        String fileType = normalizeFileType(fileTypeParam);

        ResumeFile resumeFile = ResumeFile.builder()
                .resume(resume)
                .fileType(fileType)
                .fileUrl(url)
                .build();

        resumeFile = resumeFileRepository.save(resumeFile);

        return resumeFileMapper.tResource(resumeFile);
    }

    /** Chuẩn hoá fileType từ param thành String an toàn, ngắn, có alias, default. */
    private String normalizeFileType(String raw) {
        if (raw == null) return "OTHER";
        String s = raw.trim();
        if (s.isEmpty()) return "OTHER";

        String key = s.toLowerCase();

        switch (key) {
            case "cv":
            case "resume":
            case "pdf": return "CV";

            case "certificate":
            case "cert":
            case "chungchi": return "CERTIFICATE";

            case "transcript":
            case "bangdiem": return "TRANSCRIPT";

            case "portfolio":
            case "port": return "PORTFOLIO";
        }

        String sanitized = key.replaceAll("[^a-z0-9\\- _]", " ").replaceAll("\\s+", " ").trim().toUpperCase();

        if (sanitized.length() > 32) sanitized = sanitized.substring(0, 32);

        return sanitized.isEmpty() ? "OTHER" : sanitized;
    }


    @Transactional
    public void deleteFile(Long userId, Long fileId) {
        ResumeFile rf = resumeFileRepository.findById(fileId)
                .orElseThrow(() -> new EntityNotFoundException("File không tồn tại"));

        Path filePath = Paths.get("uploads", "resumes")
                .resolve(Paths.get(rf.getFileUrl().replace("/resumes/", "")))
                .normalize();
        try { Files.deleteIfExists(filePath); } catch (IOException ignore) {}

        resumeFileRepository.delete(rf);
    }
}
