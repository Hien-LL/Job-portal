package com.jobportal.commons;

import com.jobportal.securities.filters.FilterParameter;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
public class BaseService {
    protected <T> Specification<T> hasUser(Long userId) {
        return (root, query, cb) ->
                cb.equal(root.get("user").get("id"), userId);
    }
    protected Sort createSort(String sortParam) {
        if (sortParam == null || sortParam.isEmpty()) {
            return Sort.by(Sort.Order.asc("id"));
        }
        String[] parts = sortParam.split(",");
        String field = parts[0];
        String sortDirection = (parts.length > 1) ? parts[1] : "asc";

        if ("desc".equalsIgnoreCase(sortDirection)) {
            return Sort.by(Sort.Order.desc(field));
        } else {
            return Sort.by(Sort.Order.asc(field));
        }
    }

    protected Sort sortParam(Map<String, String[]> parameters) {
        String sortParam = parameters.containsKey("sort") ? parameters.get("sort")[0] : null;
        return createSort(sortParam);
    }

    protected <T> Specification<T> specificationParam(Map<String, String[]> parameters) {
        String keyword = FilterParameter.filtertKeyword(parameters);
        Map<String, String> filterSimple = FilterParameter.filterSimple(parameters);
        Map<String, Map<String, String>> filterComplex = FilterParameter.filterComplex(parameters);

        return Specification.where(
                        BaseSpecification.<T>keyword(keyword, "name"))
                .and(BaseSpecification.<T>whereSpec(filterSimple)
                        .and(BaseSpecification.complexWhereSpec(filterComplex)));
    }


    // Validate file is image and size <= 5MB
    protected void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("File rỗng");
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new IllegalArgumentException("Chỉ cho phép file ảnh");
        }
        // Giới hạn 5MB
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Ảnh quá lớn (<= 5MB)");
        }
    }

    // 1) Chuẩn bị thư mục
    protected Path readyDirectory(String firstDir, String secondDir) {
        Path dir = Paths.get(firstDir, secondDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(dir);
        } catch (Exception e) {
            throw new RuntimeException("Không tạo được thư mục upload", e);
        }

        return dir;
    }

    // 2) Tên file mới (UUID + ext whitelist)
    protected Path generateFileName(MultipartFile file, Path avatarDir) {
        String originalFilename = StringUtils.getFilename(file.getOriginalFilename());
        String ext = (originalFilename != null && originalFilename.contains(".")) ? originalFilename.substring(originalFilename.lastIndexOf('.')) : "";
        if (!ext.toLowerCase().matches("\\.(png|jpg|jpeg|gif|webp)$")) {
            throw new IllegalArgumentException("Định dạng ảnh không hợp lệ (png/jpg/jpeg/gif/webp)");
        }
        String newName = UUID.randomUUID() + ext.toLowerCase();
        return avatarDir.resolve(newName).normalize();
    }


    // 3) Ghi file & xác thực ảnh thật bằng ImageIO
    protected void saveAndValidateImage(MultipartFile file, Path newPath) {
        try (var in = file.getInputStream()) {
            Files.copy(in, newPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Lưu file thất bại", e);
        }
        // Decode thử để chống ảnh giả mạo content-type
        try {
            var img = javax.imageio.ImageIO.read(newPath.toFile());
            if (img == null || img.getWidth() <= 0 || img.getHeight() <= 0) {
                Files.deleteIfExists(newPath);
                throw new IllegalArgumentException("File không phải ảnh hợp lệ");
            }
        } catch (IOException ex) {
            try { Files.deleteIfExists(newPath); } catch (IOException ignore) {}
            throw new RuntimeException("Không đọc được ảnh", ex);
        }
    }


    // 4) Cập nhật DB trước (nếu DB fail thì xoá file mới)

    // 5) Xoá file cũ
    protected void deleteFile(Path path, String oldUrl, Path avatarDir) {
        if (oldUrl != null && oldUrl.startsWith("/avatars/")) {
            String oldName = oldUrl.replaceFirst("^/avatars/", "");
            Path oldPath = avatarDir.resolve(oldName).normalize();
            try { Files.deleteIfExists(oldPath); } catch (Exception ignore) {}
        }
    }

}
