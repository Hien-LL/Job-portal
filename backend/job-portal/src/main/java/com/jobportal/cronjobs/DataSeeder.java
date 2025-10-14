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

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_USER = "USER";
    private static final String ROLE_TESTER = "TESTER";
    private static final String ROLE_DEV = "DEV";
    private static final String ROLE_BUSINESS = "BUSINESS";
    private static final String ROLE_CANDIDATE = "CANDIDATE";
    private static final String ROLE_EMPLOYER = "EMPLOYER";

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PermissionRepository permissionRepository;
    private final SkillRepository skillRepository;
    private final CategoryRepository categoryRepository;
    private final BenefitRepository benefitRepository;
    private final LocationRepository locationRepository;


    @Override
    @Transactional // đảm bảo session mở suốt quá trình seed (fix LazyInitialization)
    public void run(ApplicationArguments args) {
        seedRoles();
        seedPermissions();
        seedAdminUser();
        seedSkills();
        seedCategories();
        seedBenefits();
        seedLocations();
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

    private void seedCategories() {
        if (categoryRepository.count() > 0) {
            log.info("➡️ Categories already exist, skip seeding.");
            return;
        }

        log.info("Seeding default categories...");

        List<Category> categories = List.of(
                // ===== 1. IT & SOFTWARE DEVELOPMENT =====
                Category.builder().name("Lập trình Backend").slug("lap-trinh-backend").build(),
                Category.builder().name("Lập trình Frontend").slug("lap-trinh-frontend").build(),
                Category.builder().name("Lập trình Fullstack").slug("lap-trinh-fullstack").build(),
                Category.builder().name("Phát triển phần mềm").slug("phat-trien-phan-mem").build(),
                Category.builder().name("Web Development").slug("web-development").build(),
                Category.builder().name("Mobile Development").slug("mobile-development").build(),
                Category.builder().name("Game Development").slug("game-development").build(),
                Category.builder().name("Embedded Systems").slug("embedded-systems").build(),
                Category.builder().name("Automation Testing").slug("automation-testing").build(),
                Category.builder().name("Manual Testing").slug("manual-testing").build(),

                // ===== 2. IT / DEVOPS & CLOUD =====
                Category.builder().name("DevOps").slug("devops").build(),
                Category.builder().name("Cloud Engineering").slug("cloud-engineering").build(),
                Category.builder().name("System Administration").slug("system-administration").build(),
                Category.builder().name("Database Administration").slug("database-administration").build(),
                Category.builder().name("Site Reliability Engineering (SRE)").slug("site-reliability-engineering").build(),
                Category.builder().name("Observability / Monitoring").slug("observability-monitoring").build(),
                Category.builder().name("Containerization (Docker)").slug("containerization-docker").build(),
                Category.builder().name("Orchestration (Kubernetes)").slug("orchestration-kubernetes").build(),
                Category.builder().name("CI/CD Pipelines").slug("ci-cd-pipelines").build(),
                Category.builder().name("Infrastructure as Code (IaC)").slug("infrastructure-as-code").build(),

                // ===== 3. SOFTWARE PRACTICES =====
                Category.builder().name("Software Architecture").slug("software-architecture").build(),
                Category.builder().name("System Design").slug("system-design").build(),
                Category.builder().name("Design Patterns").slug("design-patterns").build(),
                Category.builder().name("Clean Code").slug("clean-code").build(),
                Category.builder().name("Refactoring").slug("refactoring").build(),
                Category.builder().name("Agile / Scrum").slug("agile-scrum").build(),
                Category.builder().name("Kanban").slug("kanban").build(),
                Category.builder().name("Product Management").slug("product-management").build(),
                Category.builder().name("API Development").slug("api-development").build(),
                Category.builder().name("API Documentation (Swagger)").slug("api-documentation-swagger").build(),

                // ===== 4. DATA / AI / MACHINE LEARNING =====
                Category.builder().name("Phân tích dữ liệu (Data Analysis)").slug("phan-tich-du-lieu").build(),
                Category.builder().name("Khoa học dữ liệu (Data Science)").slug("khoa-hoc-du-lieu").build(),
                Category.builder().name("Machine Learning").slug("machine-learning").build(),
                Category.builder().name("Deep Learning").slug("deep-learning").build(),
                Category.builder().name("AI Engineering").slug("ai-engineering").build(),
                Category.builder().name("Data Engineering").slug("data-engineering").build(),
                Category.builder().name("Big Data").slug("big-data").build(),
                Category.builder().name("Business Intelligence").slug("business-intelligence").build(),
                Category.builder().name("Data Visualization").slug("data-visualization").build(),
                Category.builder().name("Data Governance").slug("data-governance").build(),

                // ===== 5. DATA PLATFORM & ANALYTICS =====
                Category.builder().name("ETL / ELT Pipelines").slug("etl-elt-pipelines").build(),
                Category.builder().name("Data Warehousing").slug("data-warehousing").build(),
                Category.builder().name("Data Lake / Lakehouse").slug("data-lake-lakehouse").build(),
                Category.builder().name("Streaming Data (Kafka)").slug("streaming-data-kafka").build(),
                Category.builder().name("Realtime Analytics").slug("realtime-analytics").build(),
                Category.builder().name("MLOps").slug("mlops").build(),
                Category.builder().name("Feature Engineering").slug("feature-engineering").build(),
                Category.builder().name("A/B Testing & Experimentation").slug("ab-testing-experimentation").build(),
                Category.builder().name("Forecasting / Predictive Analytics").slug("forecasting-predictive-analytics").build(),
                Category.builder().name("NLP / Computer Vision").slug("nlp-computer-vision").build(),

                // ===== 6. MARKETING =====
                Category.builder().name("Digital Marketing").slug("digital-marketing").build(),
                Category.builder().name("Content Marketing").slug("content-marketing").build(),
                Category.builder().name("SEO / SEM").slug("seo-sem").build(),
                Category.builder().name("Social Media Marketing").slug("social-media-marketing").build(),
                Category.builder().name("Email Marketing").slug("email-marketing").build(),
                Category.builder().name("Affiliate Marketing").slug("affiliate-marketing").build(),
                Category.builder().name("Influencer Marketing").slug("influencer-marketing").build(),
                Category.builder().name("Performance Marketing").slug("performance-marketing").build(),
                Category.builder().name("Brand Management").slug("brand-management").build(),
                Category.builder().name("Public Relations (PR)").slug("public-relations").build(),

                // ===== 7. DESIGN / CREATIVE =====
                Category.builder().name("UI/UX Design").slug("ui-ux-design").build(),
                Category.builder().name("Graphic Design").slug("graphic-design").build(),
                Category.builder().name("Product Design").slug("product-design").build(),
                Category.builder().name("3D Modeling / Animation").slug("3d-modeling-animation").build(),
                Category.builder().name("Video Editing").slug("video-editing").build(),
                Category.builder().name("Motion Graphic Design").slug("motion-graphic-design").build(),
                Category.builder().name("Game Art").slug("game-art").build(),
                Category.builder().name("Typography").slug("typography").build(),
                Category.builder().name("UX Research").slug("ux-research").build(),
                Category.builder().name("Design System Management").slug("design-system-management").build(),

                // ===== 8. NETWORKING / SYSTEM / HARDWARE =====
                Category.builder().name("Mạng máy tính (Networking)").slug("mang-may-tinh").build(),
                Category.builder().name("Bảo mật hệ thống (Network Security)").slug("bao-mat-he-thong").build(),
                Category.builder().name("Routing & Switching").slug("routing-switching").build(),
                Category.builder().name("Cloud Networking").slug("cloud-networking").build(),
                Category.builder().name("Server Management").slug("server-management").build(),
                Category.builder().name("Virtualization").slug("virtualization").build(),
                Category.builder().name("Firewall Configuration").slug("firewall-configuration").build(),
                Category.builder().name("IoT (Internet of Things)").slug("iot").build(),
                Category.builder().name("Wireless Technology").slug("wireless-technology").build(),
                Category.builder().name("IT Support / Helpdesk").slug("it-support-helpdesk").build(),

                // ===== 9. BUSINESS / SALES / OPERATIONS =====
                Category.builder().name("Quản trị kinh doanh").slug("quan-tri-kinh-doanh").build(),
                Category.builder().name("Quản lý dự án (Project Management)").slug("quan-ly-du-an").build(),
                Category.builder().name("Khởi nghiệp / Startup").slug("khoi-nghiep-startup").build(),
                Category.builder().name("Phân tích kinh doanh (Business Analyst)").slug("phan-tich-kinh-doanh").build(),
                Category.builder().name("Chăm sóc khách hàng").slug("cham-soc-khach-hang").build(),
                Category.builder().name("Bán hàng (Sales)").slug("ban-hang").build(),
                Category.builder().name("E-commerce").slug("ecommerce").build(),
                Category.builder().name("Logistics / Supply Chain").slug("logistics-supply-chain").build(),
                Category.builder().name("Procurement / Purchasing").slug("procurement-purchasing").build(),
                Category.builder().name("Customer Success").slug("customer-success").build(),

                // ===== 10. FINANCE / ACCOUNTING =====
                Category.builder().name("Kế toán / Kiểm toán").slug("ke-toan-kiem-toan").build(),
                Category.builder().name("Phân tích tài chính").slug("phan-tich-tai-chinh").build(),
                Category.builder().name("Ngân hàng / Tín dụng").slug("ngan-hang-tin-dung").build(),
                Category.builder().name("Đầu tư / Chứng khoán").slug("dau-tu-chung-khoan").build(),
                Category.builder().name("Bảo hiểm / Tài sản").slug("bao-hiem-tai-san").build(),
                Category.builder().name("Tài chính doanh nghiệp").slug("tai-chinh-doanh-nghiep").build(),
                Category.builder().name("Thuế / Kiểm toán nội bộ").slug("thue-kiem-toan-noi-bo").build(),
                Category.builder().name("Quản lý ngân sách").slug("quan-ly-ngan-sach").build(),
                Category.builder().name("Tư vấn tài chính cá nhân").slug("tu-van-tai-chinh-ca-nhan").build(),
                Category.builder().name("Phân tích rủi ro tài chính").slug("phan-tich-rui-ro-tai-chinh").build(),

                // ===== 11. EDUCATION / TRAINING =====
                Category.builder().name("Giảng dạy / Đào tạo").slug("giang-day-dao-tao").build(),
                Category.builder().name("Phát triển chương trình học").slug("phat-trien-chuong-trinh-hoc").build(),
                Category.builder().name("Tư vấn hướng nghiệp").slug("tu-van-huong-nghiep").build(),
                Category.builder().name("Giáo dục trực tuyến (E-learning)").slug("giao-duc-truc-tuyen").build(),
                Category.builder().name("Ngôn ngữ / Phiên dịch").slug("ngon-ngu-phien-dich").build(),
                Category.builder().name("Kỹ năng mềm (Soft Skills)").slug("ky-nang-mem").build(),
                Category.builder().name("Đào tạo doanh nghiệp").slug("dao-tao-doanh-nghiep").build(),
                Category.builder().name("Nghiên cứu giáo dục").slug("nghien-cuu-giao-duc").build(),
                Category.builder().name("Tâm lý học giáo dục").slug("tam-ly-hoc-giao-duc").build(),
                Category.builder().name("Giáo viên ngoại ngữ").slug("giao-vien-ngoai-ngu").build(),

                // ===== 12. ENGINEERING / MANUFACTURING =====
                Category.builder().name("Kỹ thuật cơ khí").slug("ky-thuat-co-khi").build(),
                Category.builder().name("Điện - Điện tử").slug("dien-dien-tu").build(),
                Category.builder().name("Tự động hóa (Automation)").slug("tu-dong-hoa").build(),
                Category.builder().name("Xây dựng / Kết cấu").slug("xay-dung-ket-cau").build(),
                Category.builder().name("Kiến trúc / Thiết kế công trình").slug("kien-truc-thiet-ke-cong-trinh").build(),
                Category.builder().name("Kỹ thuật ô tô").slug("ky-thuat-o-to").build(),
                Category.builder().name("Kỹ thuật môi trường").slug("ky-thuat-moi-truong").build(),
                Category.builder().name("Quản lý sản xuất").slug("quan-ly-san-xuat").build(),
                Category.builder().name("Chất lượng / QA-QC").slug("chat-luong-qa-qc").build(),
                Category.builder().name("Công nghệ vật liệu").slug("cong-nghe-vat-lieu").build(),

                // ===== 13. HEALTHCARE / BIO =====
                Category.builder().name("Y tế / Điều dưỡng").slug("y-te-dieu-duong").build(),
                Category.builder().name("Dược phẩm / Hóa sinh").slug("duoc-pham-hoa-sinh").build(),
                Category.builder().name("Chẩn đoán hình ảnh").slug("chan-doan-hinh-anh").build(),
                Category.builder().name("Quản lý bệnh viện").slug("quan-ly-benh-vien").build(),
                Category.builder().name("Thể dục / Dinh dưỡng").slug("the-duc-dinh-duong").build(),
                Category.builder().name("Tư vấn sức khỏe").slug("tu-van-suc-khoe").build(),
                Category.builder().name("Phòng thí nghiệm").slug("phong-thi-nghiem").build(),
                Category.builder().name("Tâm lý học lâm sàng").slug("tam-ly-hoc-lam-sang").build(),
                Category.builder().name("Chăm sóc sắc đẹp").slug("cham-soc-sac-dep").build(),
                Category.builder().name("Dịch vụ cộng đồng").slug("dich-vu-cong-dong").build()
        );

        categoryRepository.saveAll(categories);
        log.info("✅ Seeded default categories");
    }

    private void seedBenefits() {
        if (benefitRepository.count() > 0) {
            log.info("➡️ Benefits already exist, skip seeding.");
            return;
        }

        log.info("Seeding default benefits...");

        List<Benefit> benefits = List.of(
                Benefit.builder().name("Bảo hiểm sức khỏe").build(),
                Benefit.builder().name("Bảo hiểm tai nạn").build(),
                Benefit.builder().name("Bảo hiểm xã hội đầy đủ").build(),
                Benefit.builder().name("Thưởng hiệu suất").build(),
                Benefit.builder().name("Thưởng Tết").build(),
                Benefit.builder().name("Thưởng tháng 13").build(),
                Benefit.builder().name("Thưởng quý").build(),
                Benefit.builder().name("Thưởng doanh số").build(),
                Benefit.builder().name("Phụ cấp ăn trưa").build(),
                Benefit.builder().name("Phụ cấp xăng xe").build(),
                Benefit.builder().name("Phụ cấp điện thoại").build(),
                Benefit.builder().name("Phụ cấp nhà ở").build(),
                Benefit.builder().name("Phụ cấp công tác").build(),
                Benefit.builder().name("Phụ cấp gửi xe").build(),
                Benefit.builder().name("Phụ cấp Internet").build(),
                Benefit.builder().name("Phụ cấp làm thêm giờ").build(),
                Benefit.builder().name("Du lịch công ty hằng năm").build(),
                Benefit.builder().name("Teambuilding định kỳ").build(),
                Benefit.builder().name("Quà sinh nhật").build(),
                Benefit.builder().name("Quà lễ tết").build(),
                Benefit.builder().name("Khám sức khỏe định kỳ").build(),
                Benefit.builder().name("Chế độ thai sản").build(),
                Benefit.builder().name("Chế độ hiếu hỷ").build(),
                Benefit.builder().name("Chế độ nghỉ phép năm").build(),
                Benefit.builder().name("Làm việc từ xa").build(),
                Benefit.builder().name("Giờ làm việc linh hoạt").build(),
                Benefit.builder().name("Cơ hội thăng tiến").build(),
                Benefit.builder().name("Đào tạo nội bộ").build(),
                Benefit.builder().name("Học bổng đào tạo bên ngoài").build(),
                Benefit.builder().name("Chương trình mentoring").build(),
                Benefit.builder().name("Môi trường làm việc trẻ trung").build(),
                Benefit.builder().name("Không gian làm việc hiện đại").build(),
                Benefit.builder().name("Laptop cá nhân công ty cấp").build(),
                Benefit.builder().name("Thiết bị làm việc hiện đại").build(),
                Benefit.builder().name("Được cấp phần mềm bản quyền").build(),
                Benefit.builder().name("Làm việc 5 ngày/tuần").build(),
                Benefit.builder().name("Không yêu cầu tăng ca").build(),
                Benefit.builder().name("Thưởng dự án hoàn thành").build(),
                Benefit.builder().name("Thưởng sáng kiến").build(),
                Benefit.builder().name("Thưởng KPI cá nhân").build(),
                Benefit.builder().name("Thưởng nhóm xuất sắc").build(),
                Benefit.builder().name("Cơ hội ra nước ngoài công tác").build(),
                Benefit.builder().name("Hỗ trợ visa đi công tác").build(),
                Benefit.builder().name("Du lịch nước ngoài").build(),
                Benefit.builder().name("Nghỉ phép dài hạn sau 3 năm").build(),
                Benefit.builder().name("Mua cổ phần ưu đãi").build(),
                Benefit.builder().name("Tham gia quỹ đầu tư nhân viên").build(),
                Benefit.builder().name("Chính sách thưởng cổ phiếu").build(),
                Benefit.builder().name("Chỗ nghỉ ngơi trong văn phòng").build(),
                Benefit.builder().name("Cung cấp đồ uống miễn phí").build(),
                Benefit.builder().name("Cung cấp cà phê miễn phí").build(),
                Benefit.builder().name("Có phòng gym trong công ty").build(),
                Benefit.builder().name("Có khu vực giải trí").build(),
                Benefit.builder().name("Câu lạc bộ nội bộ").build(),
                Benefit.builder().name("Hoạt động thiện nguyện").build(),
                Benefit.builder().name("Ngày hội gia đình công ty").build(),
                Benefit.builder().name("Chương trình gắn kết nhân viên").build(),
                Benefit.builder().name("Công ty tặng quà con nhân viên").build(),
                Benefit.builder().name("Cấp đồng phục công ty").build(),
                Benefit.builder().name("Cung cấp bảo hộ lao động").build(),
                Benefit.builder().name("Phòng làm việc điều hòa 100%").build(),
                Benefit.builder().name("Công ty hỗ trợ chỗ ở").build(),
                Benefit.builder().name("Xe đưa đón nhân viên").build(),
                Benefit.builder().name("Hỗ trợ gửi trẻ").build(),
                Benefit.builder().name("Hỗ trợ học phí cho con nhân viên").build(),
                Benefit.builder().name("Hỗ trợ chuyển nơi ở").build(),
                Benefit.builder().name("Hỗ trợ vay lãi suất thấp").build(),
                Benefit.builder().name("Hỗ trợ mua thiết bị làm việc").build(),
                Benefit.builder().name("Hỗ trợ khám chữa bệnh").build(),
                Benefit.builder().name("Công ty tài trợ thể thao").build(),
                Benefit.builder().name("Tham gia giải thể thao nội bộ").build(),
                Benefit.builder().name("Hỗ trợ tâm lý nhân viên").build(),
                Benefit.builder().name("Chính sách khen thưởng đột xuất").build(),
                Benefit.builder().name("Chính sách bảo mật thông tin").build(),
                Benefit.builder().name("Công ty cung cấp bảo hiểm nhân thọ").build(),
                Benefit.builder().name("Bảo hiểm nha khoa").build(),
                Benefit.builder().name("Hỗ trợ nghỉ phép không lương dài hạn").build(),
                Benefit.builder().name("Làm việc với công nghệ hiện đại").build(),
                Benefit.builder().name("Chính sách thử việc hưởng 100% lương").build(),
                Benefit.builder().name("Chính sách review lương định kỳ").build(),
                Benefit.builder().name("Công ty minh bạch tài chính").build(),
                Benefit.builder().name("Quản lý thân thiện").build(),
                Benefit.builder().name("Đồng nghiệp hòa đồng").build(),
                Benefit.builder().name("Không yêu cầu đồng phục").build(),
                Benefit.builder().name("Làm việc tại trung tâm thành phố").build(),
                Benefit.builder().name("Có chỗ để xe miễn phí").build(),
                Benefit.builder().name("Công ty cung cấp nước uống miễn phí").build(),
                Benefit.builder().name("Phòng họp tiện nghi").build(),
                Benefit.builder().name("Phòng nghỉ trưa riêng").build(),
                Benefit.builder().name("Hỗ trợ tài chính đám cưới").build(),
                Benefit.builder().name("Hỗ trợ tài chính tang lễ").build(),
                Benefit.builder().name("Tham gia chương trình phúc lợi nội bộ").build(),
                Benefit.builder().name("Chính sách kỷ niệm thâm niên").build(),
                Benefit.builder().name("Công ty tổ chức talkshow chia sẻ").build(),
                Benefit.builder().name("Môi trường khuyến khích sáng tạo").build(),
                Benefit.builder().name("Làm việc đa văn hóa").build(),
                Benefit.builder().name("Cơ hội học hỏi từ chuyên gia").build(),
                Benefit.builder().name("Cơ hội thử sức ở nhiều vị trí").build(),
                Benefit.builder().name("Chính sách hỗ trợ startup nội bộ").build(),
                Benefit.builder().name("Tham gia chương trình nội bộ đặc biệt").build(),
                Benefit.builder().name("Công ty tài trợ học chứng chỉ").build(),
                Benefit.builder().name("Tham gia sự kiện ngành").build(),
                Benefit.builder().name("Chính sách đánh giá công bằng").build(),
                Benefit.builder().name("Thưởng nhân viên xuất sắc tháng").build()
        );


        benefitRepository.saveAll(benefits);
        log.info("✅ Seeded default benefits");
    }

    public void seedLocations() {
        if (locationRepository.count() > 0) {
            log.info("➡️ Locations already exist, skip seeding.");
            return;
        }

        log.info("Seeding default locations...");

        List<Location> locations = List.of(
                Location.builder().city("Hà Nội").countryCode("100000").displayName("Thành phố Hà Nội").build(),
                Location.builder().city("Hồ Chí Minh").countryCode("700000").displayName("Thành phố Hồ Chí Minh").build(),
                Location.builder().city("Đà Nẵng").countryCode("550000").displayName("Thành phố Đà Nẵng").build(),
                Location.builder().city("Hải Phòng").countryCode("180000").displayName("Thành phố Hải Phòng").build(),
                Location.builder().city("Cần Thơ").countryCode("900000").displayName("Thành phố Cần Thơ").build(),
                Location.builder().city("An Giang").countryCode("880000").displayName("Tỉnh An Giang").build(),
                Location.builder().city("Bà Rịa - Vũng Tàu").countryCode("780000").displayName("Tỉnh Bà Rịa - Vũng Tàu").build(),
                Location.builder().city("Bắc Giang").countryCode("260000").displayName("Tỉnh Bắc Giang").build(),
                Location.builder().city("Bắc Kạn").countryCode("230000").displayName("Tỉnh Bắc Kạn").build(),
                Location.builder().city("Bạc Liêu").countryCode("960000").displayName("Tỉnh Bạc Liêu").build(),
                Location.builder().city("Bắc Ninh").countryCode("220000").displayName("Tỉnh Bắc Ninh").build(),
                Location.builder().city("Bến Tre").countryCode("930000").displayName("Tỉnh Bến Tre").build(),
                Location.builder().city("Bình Dương").countryCode("750000").displayName("Tỉnh Bình Dương").build(),
                Location.builder().city("Bình Định").countryCode("550000").displayName("Tỉnh Bình Định").build(),
                Location.builder().city("Bình Phước").countryCode("670000").displayName("Tỉnh Bình Phước").build(),
                Location.builder().city("Bình Thuận").countryCode("770000").displayName("Tỉnh Bình Thuận").build(),
                Location.builder().city("Cà Mau").countryCode("970000").displayName("Tỉnh Cà Mau").build(),
                Location.builder().city("Cao Bằng").countryCode("210000").displayName("Tỉnh Cao Bằng").build(),
                Location.builder().city("Đắk Lắk").countryCode("630000").displayName("Tỉnh Đắk Lắk").build(),
                Location.builder().city("Đắk Nông").countryCode("650000").displayName("Tỉnh Đắk Nông").build(),
                Location.builder().city("Điện Biên").countryCode("320000").displayName("Tỉnh Điện Biên").build(),
                Location.builder().city("Đồng Nai").countryCode("760000").displayName("Tỉnh Đồng Nai").build(),
                Location.builder().city("Đồng Tháp").countryCode("810000").displayName("Tỉnh Đồng Tháp").build(),
                Location.builder().city("Gia Lai").countryCode("610000").displayName("Tỉnh Gia Lai").build(),
                Location.builder().city("Hà Giang").countryCode("310000").displayName("Tỉnh Hà Giang").build(),
                Location.builder().city("Hà Nam").countryCode("400000").displayName("Tỉnh Hà Nam").build(),
                Location.builder().city("Hà Tĩnh").countryCode("480000").displayName("Tỉnh Hà Tĩnh").build(),
                Location.builder().city("Hậu Giang").countryCode("940000").displayName("Tỉnh Hậu Giang").build(),
                Location.builder().city("Hòa Bình").countryCode("350000").displayName("Tỉnh Hòa Bình").build(),
                Location.builder().city("Hưng Yên").countryCode("160000").displayName("Tỉnh Hưng Yên").build(),
                Location.builder().city("Khánh Hòa").countryCode("650000").displayName("Tỉnh Khánh Hòa").build(),
                Location.builder().city("Kiên Giang").countryCode("920000").displayName("Tỉnh Kiên Giang").build(),
                Location.builder().city("Kon Tum").countryCode("600000").displayName("Tỉnh Kon Tum").build(),
                Location.builder().city("Lai Châu").countryCode("390000").displayName("Tỉnh Lai Châu").build()
        );


        locationRepository.saveAll(locations);
        log.info("✅ Seeded default locations");
    }
}
