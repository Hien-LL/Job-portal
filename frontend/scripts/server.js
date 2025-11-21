// scripts/server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

let morgan;
try {
  morgan = (await import('morgan')).default;
} catch {
  console.warn('[server] "morgan" not found — using minimal logger');
  morgan = () => (_opts) => (req, _res, next) => { console.log(req.method, req.url); next(); };
}

let compression;
try {
  compression = (await import('compression')).default;
} catch {
  console.warn('[server] "compression" not found — skipping compression');
  compression = () => (_req, _res, next) => next();
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const app = express();
const PORT = process.env.PORT || 3000;
// Nếu không set BACKEND_URL, mặc định trỏ về backend local
const BE = (process.env.BACKEND_URL || 'http://localhost:8080').replace(/\/+$/, '');

app.use(morgan('combined'));
app.use(compression());

// Proxy chung cho /api và các static phục vụ từ backend
const common = { target: BE, changeOrigin: true, secure: false };

app.use('/api',                 createProxyMiddleware(common));
app.use('/resumes',             createProxyMiddleware(common));
app.use('/avatars',             createProxyMiddleware(common));
app.use('/company-logos',       createProxyMiddleware(common));
app.use('/company-backgrounds', createProxyMiddleware(common));

// Serve static build từ dist/
app.use(express.static(distDir, { maxAge: '7d', etag: true, lastModified: true }));

// Cho các trang .html trong dist (multi-page)
app.get('/:page', (req, res, next) => {
  const file = path.join(distDir, `${req.params.page}.html`);
  res.sendFile(file, err => (err ? next() : null));
});

// root
app.get('/', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));

app.listen(PORT, () => {
  console.log(`🌐 Prod-like FE http://0.0.0.0:${PORT} → Proxy ${BE}`);
  console.log('⚠ Lưu ý: trên server thật dùng Nginx reverse proxy, không dùng server.js này.');
});
