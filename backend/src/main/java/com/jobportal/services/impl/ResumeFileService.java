package com.jobportal.services.impl;

import com.jobportal.dtos.resources.ResumeFileResource;
import com.jobportal.entities.Resume;
import com.jobportal.entities.ResumeFile;
import com.jobportal.mappers.ResumeFileMapper;
import com.jobportal.repositories.ResumeFileRepository;
import com.jobportal.repositories.ResumeRepository;
import com.jobportal.securities.configs.UploadConfig;
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
    private final UploadConfig uploadConfig;

    @Transactional
    public ResumeFileResource upload(Long userId, Long resumeId, MultipartFile file, String fileTypeParam) {
        validateFileSize(file, uploadConfig.getMaxSize());
        // cho phép DOC + IMAGE (hợp nhất 2 list)
        validateExtUnion(file, uploadConfig.getAllowedDocExt(), uploadConfig.getAllowedImageExt());

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new EntityNotFoundException("Resume không tồn tại"));
        if (!resume.getUser().getId().equals(userId))
            throw new IllegalArgumentException("Không được phép upload file cho resume của người khác");

        Path dir = ensureDir(uploadConfig.getBaseDir(), uploadConfig.getResumeDir());

        String ext = extOf(file);
        String filename = UUID.randomUUID() + ext;
        Path target = dir.resolve(filename).normalize();
        write(file, target);

        String url = "/" + uploadConfig.getResumeDir() + "/" + filename;
        String fileType = normalizeFileType(fileTypeParam);

        ResumeFile rf = ResumeFile.builder()
                .resume(resume)
                .fileType(fileType)
                .fileUrl(url)
                .build();

        rf = resumeFileRepository.saveAndFlush(rf);
        return resumeFileMapper.tResource(rf);
    }

    private void validateExtUnion(MultipartFile f, String csv1, String csv2) {
        String ext = extOf(f).replace(".", "");
        var allowed = new java.util.HashSet<String>();
        java.util.Arrays.stream(csv1.split(",")).forEach(s -> allowed.add(s.trim().toLowerCase()));
        java.util.Arrays.stream(csv2.split(",")).forEach(s -> allowed.add(s.trim().toLowerCase()));
        if (!allowed.contains(ext.toLowerCase())) {
            throw new IllegalArgumentException("Định dạng không hợp lệ: ." + ext + " (cho phép: " + String.join(",", allowed));
        }
    }

    private String normalizeFileType(String raw) {
        if (raw == null || raw.isBlank()) return "OTHER";
        String key = raw.trim().toLowerCase();
        return switch (key) {
            case "cv", "resume", "pdf" -> "CV";
            case "certificate", "cert", "chungchi" -> "CERTIFICATE";
            case "transcript", "bangdiem" -> "TRANSCRIPT";
            case "portfolio", "port" -> "PORTFOLIO";
            default -> {
                String s = key.replaceAll("[^a-z0-9\\- _]", " ").replaceAll("\\s+", " ").trim().toUpperCase();
                yield s.isEmpty() ? "OTHER" : (s.length() > 32 ? s.substring(0, 32) : s);
            }
        };
    }

    @Override
    @Transactional
    public void deleteFile(Long userId, Long fileId) {
        ResumeFile rf = resumeFileRepository.findById(fileId)
                .orElseThrow(() -> new EntityNotFoundException("File không tồn tại"));

        // quyền: chủ resume
        if (!rf.getResume().getUser().getId().equals(userId))
            throw new SecurityException("Không có quyền xoá file này");

        // xoá vật lý nếu đúng prefix
        deleteByPublicUrl("/" + uploadConfig.getResumeDir() + "/", rf.getFileUrl(), uploadConfig.getBaseDir());

        resumeFileRepository.delete(rf);
    }

    // ===== helpers dùng chung =====
    private Path ensureDir(String... parts) {
        Path p = Paths.get("", parts).toAbsolutePath().normalize();
        try { Files.createDirectories(p); } catch (IOException e) { throw new RuntimeException("Không tạo được thư mục: " + p, e); }
        return p;
    }

    private void write(MultipartFile file, Path target) {
        try { Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING); }
        catch (IOException e) { throw new RuntimeException("Lưu file thất bại", e); }
    }

    private void assertRealImageOrRollback(Path path) {
        try {
            if (javax.imageio.ImageIO.read(path.toFile()) == null) {
                Files.deleteIfExists(path);
                throw new IllegalArgumentException("File không phải ảnh hợp lệ");
            }
        } catch (IOException e) {
            try { Files.deleteIfExists(path); } catch (IOException ignore) {}
            throw new RuntimeException("Không đọc được ảnh", e);
        }
    }

    private void validateFileSize(MultipartFile f, String max) {
        if (f == null || f.isEmpty()) throw new IllegalArgumentException("File rỗng");
        long maxBytes = org.springframework.util.unit.DataSize.parse(max).toBytes();
        if (f.getSize() > maxBytes) throw new IllegalArgumentException("Dung lượng vượt quá " + max);
    }

    private void validateExt(MultipartFile f, String allowedCsv) {
        String ext = extOf(f).replace(".", "");
        var allowed = java.util.Arrays.stream(allowedCsv.split(",")).map(String::trim).map(String::toLowerCase).toList();
        if (!allowed.contains(ext.toLowerCase())) {
            throw new IllegalArgumentException("Định dạng không hợp lệ: ." + ext + " (cho phép: " + allowedCsv + ")");
        }
    }

    private String extOf(MultipartFile f) {
        String name = org.springframework.util.StringUtils.getFilename(f.getOriginalFilename());
        String ext = (name != null && name.contains(".")) ? name.substring(name.lastIndexOf('.')).toLowerCase() : "";
        if (ext.isBlank()) throw new IllegalArgumentException("Thiếu đuôi file");
        return ext;
    }

    private void deleteByPublicUrl(String urlPrefix, String oldUrl, String baseDir) {
        if (oldUrl == null || !oldUrl.startsWith(urlPrefix)) return;
        String filename = oldUrl.substring(urlPrefix.length());
        Path p = Paths.get(baseDir).resolve(urlPrefix.substring(1)).resolve(filename).normalize();
        try { Files.deleteIfExists(p); } catch (IOException ignore) {}
    }


}
