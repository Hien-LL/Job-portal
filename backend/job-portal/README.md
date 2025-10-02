# Job Portal - Spring Boot Application with Docker

Dự án Job Portal là một ứng dụng web tuyển dụng được xây dựng bằng Spring Boot, MySQL, và JWT Authentication. Dự án này hỗ trợ triển khai bằng Docker Container.

## 🚀 Yêu cầu hệ thống

- **Docker**: Phiên bản 20.10.0 trở lên
- **Docker Compose**: Phiên bản 1.29.0 trở lên
- **Java**: 21 (để phát triển local)
- **Maven**: 3.6+ (để phát triển local)

## 📁 Cấu trúc dự án

```
job-portal/
├── docker-compose.yml          # Cấu hình Docker Compose
├── Dockerfile                  # Build image cho ứng dụng
├── src/
│   ├── main/
│   │   ├── java/              # Source code Java
│   │   └── resources/
│   │       ├── application.properties         # Cấu hình local
│   │       ├── application-docker.properties  # Cấu hình Docker
│   │       └── db.sql         # Script khởi tạo database
│   └── test/                  # Test cases
├── pom.xml                    # Maven dependencies
└── README.md                  # File hướng dẫn này
```

## 🐳 Triển khai với Docker

### 1. Khởi chạy toàn bộ hệ thống

```bash
# Khởi chạy database và ứng dụng
docker-compose up -d

# Xem logs real-time
docker-compose logs -f

# Xem logs của một service cụ thể
docker-compose logs -f job-portal-app
docker-compose logs -f mysql
```

### 2. Quản lý containers

```bash
# Kiểm tra trạng thái containers
docker-compose ps

# Dừng tất cả services
docker-compose down

# Dừng và xóa volumes (mất data)
docker-compose down -v

# Restart một service cụ thể
docker-compose restart job-portal-app
```

### 3. Build lại ứng dụng

```bash
# Build lại và khởi chạy
docker-compose up -d --build

# Build lại chỉ ứng dụng
docker-compose build job-portal-app
```

## 🔧 Cấu hình Database

### Thông tin kết nối MySQL:
- **Host**: localhost (từ máy host) hoặc mysql (từ container)
- **Port**: 3306
- **Database**: demodb
- **Username**: root
- **Password**: 123456

### Truy cập MySQL từ bên ngoài:
```bash
# Sử dụng MySQL client
mysql -h localhost -P 3306 -u root -p

# Hoặc sử dụng Docker exec
docker-compose exec mysql mysql -u root -p
```

## 🌐 Endpoints API

Sau khi khởi chạy thành công, ứng dụng sẽ có sẵn tại:
- **Base URL**: http://localhost:8080
- **Health Check**: http://localhost:8080/actuator/health (nếu có)

### Các API chính:
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/refresh-token` - Làm mới token
- `GET /api/users` - Lấy danh sách users
- `GET /api/roles` - Lấy danh sách roles
- `GET /api/permissions` - Lấy danh sách permissions

## 🔍 Debug và Troubleshooting

### 1. Kiểm tra logs chi tiết

```bash
# Logs của ứng dụng Spring Boot
docker-compose logs job-portal-app

# Logs của MySQL
docker-compose logs mysql

# Follow logs real-time
docker-compose logs -f --tail=100
```

### 2. Truy cập vào container

```bash
# Truy cập vào container ứng dụng
docker-compose exec job-portal-app bash

# Truy cập vào container MySQL
docker-compose exec mysql bash
```

### 3. Kiểm tra network và connectivity

```bash
# Kiểm tra network
docker network ls
docker network inspect job-portal_job-portal-network

# Test kết nối database từ app container
docker-compose exec job-portal-app ping mysql
```

### 4. Các lỗi thường gặp

#### Lỗi kết nối database:
```bash
# Kiểm tra MySQL container có chạy không
docker-compose ps mysql

# Restart MySQL nếu cần
docker-compose restart mysql
```

#### Lỗi port đã được sử dụng:
```bash
# Kiểm tra port nào đang sử dụng
netstat -tulpn | grep :8080
netstat -tulpn | grep :3306

# Thay đổi port trong docker-compose.yml nếu cần
```

## 🛠 Phát triển Local

### 1. Chạy chỉ MySQL với Docker:

```bash
# Tạo file docker-compose.dev.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: job-portal-mysql-dev
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: demodb
    ports:
      - "3306:3306"
    volumes:
      - mysql_dev_data:/var/lib/mysql
volumes:
  mysql_dev_data:

# Chạy chỉ MySQL
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Chạy ứng dụng từ IDE:

Sử dụng profile `default` với cấu hình trong `application.properties` để kết nối đến MySQL container.

## 📋 Checklist triển khai

### Trước khi triển khai:
- [ ] Đảm bảo Docker và Docker Compose đã được cài đặt
- [ ] Port 8080 và 3306 không bị chiếm dụng
- [ ] Có đủ dung lượng ổ đĩa cho MySQL data

### Sau khi triển khai:
- [ ] Kiểm tra containers đang chạy: `docker-compose ps`
- [ ] Test API health check: `curl http://localhost:8080`
- [ ] Kiểm tra kết nối database
- [ ] Test đăng nhập/đăng ký

## 🔒 Bảo mật

### Cấu hình JWT:
- **Secret**: Đã được cấu hình sẵn (nên thay đổi trong production)
- **Expiration**: 24 giờ (86400000ms) (mặc định mới đăng nhập chỉ có 5 phút, sau khi refresh thì mới được 24 giờ)
- **Refresh Token**: 24 giờ

### Cấu hình MySQL:
- **Authentication**: mysql_native_password
- **Charset**: utf8mb4

## 📚 Tài liệu tham khảo

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MySQL Docker Image](https://hub.docker.com/_/mysql)

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra logs: `docker-compose logs -f`
2. Tham khảo mục Troubleshooting ở trên
3. Tạo issue trên GitHub repository

---

**Happy Coding! 🚀**
