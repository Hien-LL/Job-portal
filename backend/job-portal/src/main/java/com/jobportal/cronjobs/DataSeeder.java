package com.jobportal.cronjobs;

import com.jobportal.entities.*;
import com.jobportal.repositories.*;
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
    private final SkillRepository skillRepository;
    @Override
    @Transactional // đảm bảo session mở suốt quá trình seed (fix LazyInitialization)
    public void run(ApplicationArguments args) {
        seedRoles();
        seedPermissions();
        seedAdminUser();
        seedSkills();
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

    private void seedSkills() {
        if (skillRepository.count() > 0) {
            log.info("➡️ Skills already exist, skip seeding.");
            return;
        }

        log.info("Seeding default skills...");

        List<Skill> skills = List.of(
                // ===== IT / SOFTWARE ENGINEERING =====
                Skill.builder().name("Java").slug("java").build(),
                Skill.builder().name("Spring Boot").slug("spring-boot").build(),
                Skill.builder().name("Hibernate / JPA").slug("hibernate-jpa").build(),
                Skill.builder().name("Maven").slug("maven").build(),
                Skill.builder().name("Gradle").slug("gradle").build(),
                Skill.builder().name("MySQL").slug("mysql").build(),
                Skill.builder().name("PostgreSQL").slug("postgresql").build(),
                Skill.builder().name("MongoDB").slug("mongodb").build(),
                Skill.builder().name("Redis").slug("redis").build(),
                Skill.builder().name("RESTful API").slug("restful-api").build(),
                Skill.builder().name("GraphQL").slug("graphql").build(),
                Skill.builder().name("Microservices Architecture").slug("microservices-architecture").build(),
                Skill.builder().name("Spring Security").slug("spring-security").build(),
                Skill.builder().name("JWT Authentication").slug("jwt-authentication").build(),
                Skill.builder().name("OAuth2").slug("oauth2").build(),
                Skill.builder().name("JUnit / Mockito").slug("junit-mockito").build(),
                Skill.builder().name("CI/CD").slug("ci-cd").build(),
                Skill.builder().name("Docker").slug("docker").build(),
                Skill.builder().name("Kubernetes").slug("kubernetes").build(),
                Skill.builder().name("Linux").slug("linux").build(),
                Skill.builder().name("Bash / Shell Script").slug("bash-shell-script").build(),
                Skill.builder().name("Git / GitHub / GitLab").slug("git-github-gitlab").build(),
                Skill.builder().name("VS Code / IntelliJ IDEA").slug("vscode-intellij").build(),
                Skill.builder().name("Agile / Scrum").slug("agile-scrum").build(),
                Skill.builder().name("System Design").slug("system-design").build(),
                Skill.builder().name("Software Architecture").slug("software-architecture").build(),
                Skill.builder().name("Clean Code").slug("clean-code").build(),
                Skill.builder().name("Design Patterns").slug("design-patterns").build(),
                Skill.builder().name("API Documentation (Swagger)").slug("api-documentation-swagger").build(),
                Skill.builder().name("Jenkins").slug("jenkins").build(),
                Skill.builder().name("Nginx").slug("nginx").build(),
                Skill.builder().name("Apache Tomcat").slug("apache-tomcat").build(),
                Skill.builder().name("AWS").slug("aws").build(),
                Skill.builder().name("Azure").slug("azure").build(),
                Skill.builder().name("Google Cloud Platform").slug("gcp").build(),
                Skill.builder().name("HTML / CSS / JS").slug("html-css-js").build(),
                Skill.builder().name("ReactJS").slug("reactjs").build(),
                Skill.builder().name("NextJS").slug("nextjs").build(),
                Skill.builder().name("NodeJS / Express").slug("nodejs-express").build(),
                Skill.builder().name("TypeScript").slug("typescript").build(),
                Skill.builder().name("Android Development").slug("android-development").build(),
                Skill.builder().name("iOS Development").slug("ios-development").build(),
                Skill.builder().name("Flutter").slug("flutter").build(),
                Skill.builder().name("React Native").slug("react-native").build(),
                Skill.builder().name("Firebase").slug("firebase").build(),
                Skill.builder().name("WebSocket / Socket.IO").slug("websocket-socketio").build(),
                Skill.builder().name("Unit Testing").slug("unit-testing").build(),
                Skill.builder().name("API Integration").slug("api-integration").build(),
                Skill.builder().name("Performance Optimization").slug("performance-optimization").build(),
                Skill.builder().name("Problem Solving").slug("problem-solving").build(),

                // ===== MARKETING =====
                Skill.builder().name("Digital Marketing").slug("digital-marketing").build(),
                Skill.builder().name("Content Marketing").slug("content-marketing").build(),
                Skill.builder().name("SEO / SEM").slug("seo-sem").build(),
                Skill.builder().name("Google Ads").slug("google-ads").build(),
                Skill.builder().name("Facebook Ads").slug("facebook-ads").build(),
                Skill.builder().name("Email Marketing").slug("email-marketing").build(),
                Skill.builder().name("Copywriting").slug("copywriting").build(),
                Skill.builder().name("Social Media Management").slug("social-media-management").build(),
                Skill.builder().name("Brand Strategy").slug("brand-strategy").build(),
                Skill.builder().name("Influencer Marketing").slug("influencer-marketing").build(),
                Skill.builder().name("Tiktok Marketing").slug("tiktok-marketing").build(),
                Skill.builder().name("YouTube Marketing").slug("youtube-marketing").build(),
                Skill.builder().name("Market Research").slug("market-research").build(),
                Skill.builder().name("Customer Journey Mapping").slug("customer-journey-mapping").build(),
                Skill.builder().name("Campaign Planning").slug("campaign-planning").build(),
                Skill.builder().name("Data-Driven Marketing").slug("data-driven-marketing").build(),
                Skill.builder().name("Affiliate Marketing").slug("affiliate-marketing").build(),
                Skill.builder().name("CRM Management").slug("crm-management").build(),
                Skill.builder().name("Lead Generation").slug("lead-generation").build(),
                Skill.builder().name("A/B Testing").slug("a-b-testing").build(),

                // ===== DATA / AI =====
                Skill.builder().name("Data Analysis").slug("data-analysis").build(),
                Skill.builder().name("Data Visualization").slug("data-visualization").build(),
                Skill.builder().name("Power BI").slug("power-bi").build(),
                Skill.builder().name("Tableau").slug("tableau").build(),
                Skill.builder().name("Excel / Google Sheets").slug("excel-google-sheets").build(),
                Skill.builder().name("Python").slug("python").build(),
                Skill.builder().name("Pandas / NumPy").slug("pandas-numpy").build(),
                Skill.builder().name("Machine Learning").slug("machine-learning").build(),
                Skill.builder().name("Deep Learning").slug("deep-learning").build(),
                Skill.builder().name("Natural Language Processing").slug("nlp").build(),
                Skill.builder().name("Computer Vision").slug("computer-vision").build(),
                Skill.builder().name("Data Cleaning").slug("data-cleaning").build(),
                Skill.builder().name("SQL for Analytics").slug("sql-for-analytics").build(),
                Skill.builder().name("ETL Pipelines").slug("etl-pipelines").build(),
                Skill.builder().name("Big Data").slug("big-data").build(),
                Skill.builder().name("Spark").slug("spark").build(),
                Skill.builder().name("TensorFlow / PyTorch").slug("tensorflow-pytorch").build(),
                Skill.builder().name("Data Governance").slug("data-governance").build(),
                Skill.builder().name("AI Ethics").slug("ai-ethics").build(),
                Skill.builder().name("Predictive Analytics").slug("predictive-analytics").build(),

                // ===== NETWORKING / SECURITY =====
                Skill.builder().name("Networking Fundamentals").slug("networking-fundamentals").build(),
                Skill.builder().name("CCNA").slug("ccna").build(),
                Skill.builder().name("Network Security").slug("network-security").build(),
                Skill.builder().name("Firewall Configuration").slug("firewall-configuration").build(),
                Skill.builder().name("Routing & Switching").slug("routing-switching").build(),
                Skill.builder().name("VPN Configuration").slug("vpn-configuration").build(),
                Skill.builder().name("Penetration Testing").slug("penetration-testing").build(),
                Skill.builder().name("Ethical Hacking").slug("ethical-hacking").build(),
                Skill.builder().name("Cybersecurity").slug("cybersecurity").build(),
                Skill.builder().name("Cloud Security").slug("cloud-security").build()
        );


        skillRepository.saveAll(skills);
        log.info("✅ Seeded default skills");
    }
}
