
# 🚀 HƯỚNG DẪN TRIỂN KHAI DOCKER APP LÊN DIGITALOCEAN (CÓ IMAGE SẴN)

## 1️⃣ Tạo Droplet
- Image: Ubuntu 24.04 LTS
- Size: 1vCPU / 1GB RAM (hoặc hơn nếu có budget)
- Region: Singapore
- Thêm SSH key khi tạo

## 2️⃣ SSH vào Droplet
```bash
ssh root@<IP_DROPLET>
```

## 3️⃣ Tạo user riêng
```bash
adduser deployer
usermod -aG sudo deployer
su - deployer
```

## 4️⃣ Cài Docker + Compose
```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release; echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

## 5️⃣ Thêm quyền docker
```bash
sudo usermod -aG docker deployer
```

## 6️⃣ Tạo thư mục project
```bash
mkdir -p ~/job-portal/{logs,uploads}
cd ~/job-portal
```

## 7️⃣ Tạo file .env
```bash
cat > .env <<'EOF'
MYSQL_DATABASE=demodb
MYSQL_USER=jobportal
MYSQL_PASSWORD=jobportal123
MYSQL_ROOT_PASSWORD=123456
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=w2c4k8H8tM2r7vC1yQ9m3P5s7U1a9L6n4b2X8f0J2q6R8t1Y3u5W7z9K1m3P5s7U9x1Z3c5V7y9
JWT_ISSUER=https://api.jobportal.dev
APP_IMAGE=xangjjj22/job-portal:1.0
APP_PORT=8080
EOF
```

## 8️⃣ docker-compose.yml
*(như trong hướng dẫn ở chat trên, gồm app + mysql)*

## 9️⃣ Chạy stack
```bash
docker compose pull
docker compose up -d
docker logs -f job-portal-backend
```

## 🔟 Test app
```bash
curl http://localhost:8080/actuator/health
```

## 11️⃣ Thêm HTTPS (Caddy, optional)
*(cấu hình Caddyfile, thêm service caddy, mở port 80/443)*

## 12️⃣ Auto restart khi reboot
*(systemd jobportal.service như hướng dẫn)*

## 13️⃣ Dọn dẹp
```bash
sudo apt update && sudo apt upgrade -y
docker image prune -f
```

## 14️⃣ Backup DB
```bash
docker run --rm -v job-portal_mysql_data:/data -v $(pwd):/backup alpine   tar czf /backup/mysql_$(date +%F).tgz /data
```
