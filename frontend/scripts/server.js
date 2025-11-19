// scripts/server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Dynamic imports + safe fallbacks so the prod server won't crash if optional
// middleware isn't available in the environment.
let morgan;
try {
  morgan = (await import('morgan')).default;
} catch (err) {
  console.warn('[server] optional package "morgan" not found — using minimal logger');
  morgan = () => (_opts) => (req, _res, next) => { console.log(req.method, req.url); next(); };
}

let compression;
try {
  compression = (await import('compression')).default;
} catch (err) {
  console.warn('[server] optional package "compression" not found — skipping compression');
  compression = () => (_req, _res, next) => next();
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const app = express();
const PORT = process.env.PORT || 3000;
const BE   = process.env.BACKEND_URL || 'http://localhost:8080';

app.use(morgan('combined'));
app.use(compression());

const common = { target: BE, changeOrigin: true, secure: false };
app.use('/api',     createProxyMiddleware(common));
app.use('/resumes', createProxyMiddleware(common));
app.use('/uploads', createProxyMiddleware(common));

app.use(express.static(distDir, { maxAge: '7d', etag: true, lastModified: true }));

// cho các trang .html trong dist
app.get('/:page', (req, res, next) => {
  const file = path.join(distDir, `${req.params.page}.html`);
  res.sendFile(file, err => (err ? next() : null));
});

app.get('/', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));

app.listen(PORT, () => {
  console.log(`🌐 Prod FE http://0.0.0.0:${PORT} → Proxy ${BE}`);
});
