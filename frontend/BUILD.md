# 🏗️ Build Guide - Job Portal Frontend

Hướng dẫn setup và build frontend Job Portal bằng Node.js.

## 📋 Prerequisites (Yêu cầu)

- **Node.js** v16+ ([Download](https://nodejs.org/))
- **npm** v7+ (đi kèm với Node.js)
- **Git** (để clone repo)

Kiểm tra đã cài chưa:
```bash
node --version
npm --version
```

---

## 🚀 Quick Start

### 1️⃣ Clone Repository
```bash
git clone https://github.com/Hien-LL/Job-portal.git
cd Job-portal/frontend
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Chọn mode phù hợp

#### 👨‍💻 Development Mode (Phát triển)
Chạy dev server tại `http://localhost:3000`:
```bash
npm run dev
# hoặc
npm start
```

**Tính năng:**
- Hot reload (tự động refresh browser khi thay đổi file)
- Full source maps cho debugging
- Không minify code (dễ debug)

#### 🔨 Build Production (Triển khai)
Minify & optimize code, output vào folder `dist/`:
```bash
npm run build
```

**Output:**
```
dist/
├── *.html (tất cả HTML files)
├── css/
│   ├── components.css (minified)
│   └── tailwind.css (minified)
├── js/ (tất cả .js files minified)
├── fragments/ (reusable HTML components)
└── img/ (images)
```

#### 👁️ Watch Mode (Auto Rebuild)
Tự động rebuild khi file thay đổi:
```bash
npm run watch
```

**Sử dụng cho:**
- Phát triển khi muốn test build output liên tục
- CI/CD pipeline
- Testing production build locally

---

## 📁 Folder Structure

```
frontend/
├── index.html, job.html, ...    # Pages
├── css/
│   ├── components.css           # Custom components
│   ├── tailwind.css            # Base styles
│   └── tailwind.config.js       # Tailwind config
├── js/
│   ├── config.js               # API config (EDIT THIS!)
│   ├── auth.js                 # Authentication
│   ├── common-helpers.js       # Shared utilities
│   ├── utils.js                # DOM helpers
│   ├── *-service.js            # Page logic
│   └── fragments-loader.js     # Fragment loader
├── fragments/
│   ├── header.html
│   ├── footer.html
│   ├── user-sidebar.html
│   └── recruiter-sidebar.html
├── img/                         # Images
├── scripts/                     # Build scripts
│   ├── build.js               # Build script
│   ├── dev-server.js          # Dev server
│   └── watch.js               # Watch script
├── dist/                        # Build output (auto-generated)
├── package.json                # Dependencies
├── .gitignore                  # Git ignore rules
└── README.md                   # Project README
```

---

## 🔧 Configuration

### API Backend URL

Edit `js/config.js` và thay đổi `BASE_URL`:

```javascript
// js/config.js
const BASE_URL = 'http://localhost:8080';  // ← Thay đổi URL backend tại đây

export const API_CONFIG = {
  USERS: {
    LOGIN: '/users/login',
    REGISTER: '/users/register',
    PROFILE: '/users/profile',
    // ...
  },
  // ...
};
```

---

## ⚡ Development Workflow

### 1. Start Dev Server
```bash
npm run dev
```
Browser sẽ mở tại `http://localhost:3000`

### 2. Edit Files
Thay đổi bất kỳ file `.html`, `.js`, `.css` nào

### 3. Browser Auto-Refresh
Browser tự động reload (nếu sử dụng Live Server extension)

### 4. Check Console
Mở DevTools (`F12`) để xem logs và debugging

---

## 🏭 Production Build & Deployment

### Step 1: Build
```bash
npm run build
```

### Step 2: Test Build Locally
```bash
# Serve dist folder trên localhost:3000
npx http-server dist -p 3000
```

### Step 3: Deploy

**Option A: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Option B: Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Option C: GitHub Pages**
1. Push `dist/` folder lên GitHub
2. Enable GitHub Pages từ Settings

**Option D: Traditional Server (FTP/SCP)**
1. Upload contents của `dist/` folder lên server
2. Configure web server (Nginx/Apache) để serve static files

---

## 🐛 Troubleshooting

### ❌ PowerShell Script Execution Error

**Error:**
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded 
because running scripts is disabled on this system.
```

**Solution A: Use cmd.exe**
```cmd
cd C:\Users\TP\Project\Job-portal\frontend
npm start
```

**Solution B: Fix PowerShell (Admin required)**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### ❌ Port 3000 Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or use different port - edit dev-server.js
```

### ❌ CORS Error from Backend

**Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
1. Kiểm tra `BASE_URL` trong `js/config.js` đúng không
2. Đảm bảo backend CORS headers đúng:
   ```
   Access-Control-Allow-Origin: http://localhost:3000
   ```
3. Xem mục "API Backend URL" ở trên

### ❌ Tailwind CSS Not Working

**Error:**
```
Styles not showing after build
```

**Solution:**
```bash
# Rebuild Tailwind
npm run build

# Check tailwind.config.js có include đúng paths không
```

### ❌ Build Fails

**Error:**
```
Error: ENOENT: no such file or directory
```

**Solution:**
```bash
# Clean install
rm -r node_modules package-lock.json
npm install
npm run build
```

---

## 📊 Build Output Summary

Sau khi chạy `npm run build`, bạn sẽ thấy:

```
🔨 Building Job Portal Frontend...

📦 Cleaning dist folder...
📄 Copying HTML files...
📚 Copying assets...
🎨 Building Tailwind CSS...
✅ Tailwind CSS built

🗜️  Minifying JavaScript files...
  ✓ config.js
  ✓ auth.js
  ✓ common-helpers.js
  ... (tất cả JS files)
✅ JavaScript minified

✨ Build complete!
📁 Output: C:\Users\TP\Project\Job-portal\frontend\dist
📊 Size: 2.25 MB

🚀 Ready for deployment!
```

---

## 📦 NPM Scripts Reference

| Command | Purpose | Usage |
|---------|---------|-------|
| `npm run dev` | Start dev server | 👨‍💻 Development |
| `npm start` | Alias for `npm run dev` | 👨‍💻 Development |
| `npm run build` | Build for production | 🏭 Deployment |
| `npm run watch` | Auto-rebuild on changes | 🔄 Continuous build |

---

## 🔐 Security Notes

- ✅ Minified code khó reverse-engineer
- ✅ Frontend không chứa sensitive keys (dùng backend API)
- ⚠️ KHÔNG commit `.env` files chứa API keys
- ⚠️ Luôn sử dụng HTTPS trong production

---

## 📚 Additional Resources

- [Node.js Docs](https://nodejs.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Express.js Docs](https://expressjs.com/)
- [Job Portal Architecture](./TECHNICAL_ARCHITECTURE.md)

---

## ✉️ Support

Nếu gặp vấn đề:
1. Kiểm tra mục Troubleshooting ở trên
2. Xem logs trong console/terminal
3. Kiểm tra network tab trong DevTools
4. Liên hệ team development

---

**Last Updated:** November 2025
**Build System:** Node.js + Tailwind CSS + Express
**Frontend Type:** Vanilla JavaScript (No Framework)
