package com.jobportal.services.impl;

import com.jobportal.commons.BaseService;
import com.jobportal.dtos.requests.UserUpdationRequest;
import com.jobportal.dtos.resources.UserDetailsResource;
import com.jobportal.dtos.resources.UserProfileResource;
import com.jobportal.entities.User;
import com.jobportal.mappers.UserMapper;
import com.jobportal.repositories.UserRepository;
import com.jobportal.services.interfaces.UserServiceInterface;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
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
    public String uploadAvatar(Long id, MultipartFile file) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));

            if (file == null || file.isEmpty()) throw new IllegalArgumentException("File rỗng");
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new IllegalArgumentException("Chỉ cho phép file ảnh");
            }

            String uploadDir = "uploads/avatars/";
            File dir = new File(uploadDir);
            if (!dir.exists() && !dir.mkdirs()) {
                throw new IOException("Không tạo được thư mục lưu trữ");
            }

            // 1) XÓA FILE CŨ (nếu có và nằm trong /avatars/**)
            // Lưu ý: chỉ xóa file local khi url cũ bắt đầu bằng "/avatars/"
            String oldUrl = user.getAvatarUrl();
            if (oldUrl != null && oldUrl.startsWith("/avatars/")) {
                // oldUrl ví dụ: /avatars/xxx.png  -> map sang uploads/avatars/xxx.png
                String oldFilename = oldUrl.replaceFirst("^/avatars/", "");
                Path oldPath = Paths.get(uploadDir).resolve(oldFilename).normalize();
                try {
                    Files.deleteIfExists(oldPath);
                } catch (Exception ex) {
                    // Không chặn flow upload mới; log để theo dõi
                    // log.warn("Không thể xóa avatar cũ: {}", oldPath, ex);
                }
            }

            // 2) LƯU FILE MỚI
            String original = org.springframework.util.StringUtils.getFilename(file.getOriginalFilename());
            String ext = (original != null && original.contains(".")) ? original.substring(original.lastIndexOf('.')) : "";
            // Whitelist đuôi cơ bản (tùy chọn)
            if (!ext.matches("\\.(?i)(png|jpg|jpeg|gif|webp)$")) {
                throw new IllegalArgumentException("Định dạng ảnh không hợp lệ (chỉ png/jpg/jpeg/gif/webp)");
            }

            String filename = UUID.randomUUID() + ext.toLowerCase();
            Path newPath = Paths.get(uploadDir).resolve(filename).normalize();
            Files.copy(file.getInputStream(), newPath, StandardCopyOption.REPLACE_EXISTING);

            String url = "/avatars/" + filename; // khớp ResourceHandler

            user.setAvatarUrl(url);
            userRepository.save(user);

            return url;
        } catch (IOException e) {
            throw new RuntimeException("Upload failed: " + e.getMessage());
        }
    }

}
