package com.jobportal.cronjobs;

import com.jobportal.entities.Permission;
import com.jobportal.entities.Role;
import com.jobportal.entities.User;
import com.jobportal.repositories.PermissionRepository;
import com.jobportal.repositories.RoleRepository;
import com.jobportal.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@Profile("dev") // chỉ chạy khi spring.profiles.active=dev
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_USER = "USER";
    private static final String ROLE_TESTER = "TESTER";
    private static final String ROLE_DEV = "DEV";
    private static final String ROLE_BUSINESS = "BUSSINESS"; // giữ nguyên theo DB của bạn; nên sửa thành "BUSINESS" nếu có thể
    private static final String ROLE_CANDIDATE = "CANDIDATE";
    private static final String ROLE_EMPLOYER = "EMPLOYER";

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PermissionRepository permissionRepository;

    @Override
    @Transactional // đảm bảo session mở suốt quá trình seed (fix LazyInitialization)
    public void run(ApplicationArguments args) {
        seedRoles();
        seedPermissions();
        assignAllPermissionsToRoles(Set.of(ROLE_DEV, ROLE_TESTER)); // gán full quyền cho DEV & TESTER như code cũ
        seedAdminUser();
    }

    /* ================================== Seed Roles ================================== */

    private void seedRoles() {
        if (roleRepository.count() > 0) {
            log.info("➡️ Roles already exist, skip seeding.");
            return;
        }
        List<Role> roles = List.of(
                Role.builder().name(ROLE_ADMIN).priority(2).build(),
                Role.builder().name(ROLE_USER).priority(1).build(),
                Role.builder().name(ROLE_TESTER).priority(2).build(),
                Role.builder().name(ROLE_DEV).priority(2).build(),
                Role.builder().name(ROLE_BUSINESS).priority(1).build(),
                Role.builder().name(ROLE_CANDIDATE).priority(1).build(),
                Role.builder().name(ROLE_EMPLOYER).priority(1).build()
        );
        roleRepository.saveAll(roles);
        log.info("✅ Seeded default roles");
    }

    /* ================================= Seed Permissions =============================== */

    private void seedPermissions() {
        if (permissionRepository.count() > 0) {
            log.info("➡️ Permissions already exist, skip seeding.");
            return;
        }

        List<Permission> permissions = List.of(
                Permission.builder().name("READ_PERMISSION").description("Quyền xem permission").build(),
                Permission.builder().name("CREATE_PERMISSION").description("Quyền tạo mới permission").build(),
                Permission.builder().name("UPDATE_PERMISSION").description("Quyền chỉnh sửa permission").build(),
                Permission.builder().name("DELETE_PERMISSION").description("Quyền xóa permission").build(),

                Permission.builder().name("READ_ROLE").description("Quyền xem role").build(),
                Permission.builder().name("CREATE_ROLE").description("Quyền tạo mới role").build(),
                Permission.builder().name("UPDATE_ROLE").description("Quyền chỉnh sửa role").build(),
                Permission.builder().name("DELETE_ROLE").description("Quyền xóa role").build(),

                Permission.builder().name("READ_USER").description("Quyền xem user").build(),
                Permission.builder().name("CREATE_USER").description("Quyền tạo mới user").build(),
                Permission.builder().name("UPDATE_USER").description("Quyền chỉnh sửa user").build(),
                Permission.builder().name("DELETE_USER").description("Quyền xóa user").build()
        );

        permissionRepository.saveAll(permissions);
        log.info("✅ Seeded default permissions");
    }

    /* =================== Assign all permissions to given role names =================== */

    private void assignAllPermissionsToRoles(Set<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) return;

        // Lấy tất cả quyền một lần
        Set<Permission> allPermissions = new HashSet<>(permissionRepository.findAll());
        if (allPermissions.isEmpty()) {
            log.warn("⚠️ No permissions found. Skip assigning.");
            return;
        }

        // Lấy các role theo tên
        Map<String, Role> rolesByName = roleRepository.findAll().stream()
                .filter(r -> roleNames.contains(r.getName()))
                .collect(Collectors.toMap(Role::getName, r -> r));

        // Kiểm tra thiếu role
        Set<String> missing = new HashSet<>(roleNames);
        missing.removeAll(rolesByName.keySet());
        if (!missing.isEmpty()) {
            throw new IllegalStateException("Missing roles: " + missing);
        }

        // Gán full quyền (idempotent)
        rolesByName.values().forEach(role -> {
            if (role.getPermissions() == null || role.getPermissions().isEmpty()) {
                role.setPermissions(new HashSet<>(allPermissions));
            } else {
                role.getPermissions().addAll(allPermissions);
            }
            roleRepository.save(role);
            log.info("✅ Assigned all permissions to {} role", role.getName());
        });
    }

    /* ================================ Seed Admin User ================================ */

    private void seedAdminUser() {
        if (userRepository.count() > 0) {
            log.info("➡️ Users already exist, skip seeding admin.");
            return;
        }

        Role adminRole = roleRepository.findByName(ROLE_ADMIN)
                .orElseThrow(() -> new IllegalStateException("Role ADMIN not found."));

        User adminUser = new User();
        adminUser.setEmail("admin@dev.com");
        adminUser.setPassword(passwordEncoder.encode("password"));
        adminUser.setName("Quản trị viên");
        adminUser.setPhone("0775472894");
        adminUser.setAddress("Hồ Chí Minh");
        adminUser.setRoles(Set.of(adminRole));

        userRepository.save(adminUser);
        log.info("✅ Seeded admin user {}", adminUser.getEmail());
    }
}
