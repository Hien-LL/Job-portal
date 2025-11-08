package com.jobportal.services.impl;

import com.jobportal.commons.BaseService;
import com.jobportal.dtos.requests.updation.UserUpdationRequest;
import com.jobportal.dtos.resources.*;
import com.jobportal.entities.User;
import com.jobportal.mappers.UserMapper;
import com.jobportal.repositories.UserRepository;
import com.jobportal.securities.configs.UploadConfig;
import com.jobportal.services.interfaces.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class UserService extends BaseService implements UserServiceInterface {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final UploadConfig uploadConfig;
    private final UserSkillServiceInterface userSkillService;
    private final ResumeServiceInterface resumeService;
    private final ApplicationStatusServiceInterface applicationStatusService;
    private final ApplicationServiceInterface applicationService;

    @Override
    public UserProfileResource update(Long id, UserUpdationRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found"));
        userMapper.updateEntityFromRequest(request, user);
        userRepository.save(user);
        return userMapper.tProfileResource(user);
    }

    @Override
    public void delete(Long id) {
        userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Nguời dùng không tồn tại với id: " + id));
        userRepository.deleteById(id);
    }

    @Override
    public Page<User> paginate(Map<String, String[]> parameters) {
        int page = parameters.containsKey("page") ? Integer.parseInt(parameters.get("page")[0]) : 1;
        int perPage = parameters.containsKey("perPage") ? Integer.parseInt(parameters.get("perPage")[0]) : 20;
        Sort sort = sortParam(parameters);
        Specification<User> specification = specificationParam(parameters);

        Pageable pageable = PageRequest.of(page - 1, perPage, sort);
        return userRepository.findAll(specification ,pageable);
    }

    @Override
    public List<User> getAll(Map<String, String[]> parameters) {
        Sort sort = sortParam(parameters);
        Specification<User> specification = specificationParam(parameters);
        return userRepository.findAll(specification ,sort);
    }

    @Override
    public UserDetailsResource getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));
        return userMapper.tResourceDetails(user);
    }

    @Override
    @Transactional
    public String uploadAvatar(Long userId, MultipartFile file) {
        validateFileSize(file, uploadConfig.getMaxSize());
        validateExt(file, uploadConfig.getAllowedImageExt()); // chỉ ảnh

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // dirs
        Path avatarDir = ensureDir(uploadConfig.getBaseDir(), uploadConfig.getAvatarDir());

        // tên file mới
        String ext = extOf(file);
        String newName = UUID.randomUUID() + ext;
        Path newPath = avatarDir.resolve(newName);

        // ghi + xác thực ảnh thật
        write(file, newPath);
        assertRealImageOrRollback(newPath);

        // cập nhật DB trước
        String oldUrl = user.getAvatarUrl(); // "/avatars/xxx.png"
        String newUrl = "/" + uploadConfig.getAvatarDir() + "/" + newName;

        user.setAvatarUrl(newUrl);
        try {
            userRepository.saveAndFlush(user);
        } catch (RuntimeException ex) {
            try { Files.deleteIfExists(newPath); } catch (IOException ignore) {}
            throw ex;
        }

        // xoá file cũ (nếu cùng prefix)
        deleteByPublicUrl("/" + uploadConfig.getAvatarDir() + "/", oldUrl, uploadConfig.getBaseDir());

        return newUrl;
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
