// scripts/dev-server.js
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

let morgan;
try {
  morgan = (await import('morgan')).default;
} catch {
  console.warn('[dev-server] "morgan" not found — using fallback logger');
  morgan = () => (req, _res, next) => { console.log(req.method, req.url); next(); };
}

let compression;
try {
  compression = (await import('compression')).default;
} catch {
  console.warn('[dev-server] "compression" not found — skipping compression');
  compression = () => (_req, _res, next) => next();
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3000;
// Backend local: chạy Spring Boot port 8080 (hoặc chỉnh BACKEND_URL)
// Ví dụ: BACKEND_URL=http://localhost:8080
const BE = (process.env.BACKEND_URL || 'http://localhost:8080').replace(/\/+$/, '');

app.use(morgan('dev'));
app.use(compression());

function createPublicProxy(prefix) {
  return createProxyMiddleware({
    target: BE,
    changeOrigin: true,
    secure: false,
    xfwd: true,
    logLevel: 'debug',
    pathRewrite: (pathUrl) => {
      if (!pathUrl.startsWith(`${prefix}/`)) {
        return `${prefix}${pathUrl.startsWith('/') ? pathUrl : '/' + pathUrl}`;
      }
      return pathUrl;
    },
    onProxyReq(proxyReq, req) {
      proxyReq.removeHeader?.('authorization');
      proxyReq.removeHeader?.('cookie');
      proxyReq.removeHeader?.('x-access-token');

      if (req.headers['range']) proxyReq.setHeader('range', req.headers['range']);
      if (req.headers['if-range']) proxyReq.setHeader('if-range', req.headers['if-range']);
    },
    onProxyRes(proxyRes) {
      if (proxyRes.headers['www-authenticate']) delete proxyRes.headers['www-authenticate'];
      if (proxyRes.headers['set-cookie']) delete proxyRes.headers['set-cookie'];
    },
    onError(err, req, res) {
      console.error(`[proxy-error ${prefix}]`, req.method, req.url, err?.message);
      if (!res.headersSent) {
        res.status(502).json({ success: false, error: { message: `Proxy error (${prefix})` } });
      }
    }
  });
}

// Proxy các đường dẫn static public -> backend (Spring Boot)
app.use('/resumes',             createPublicProxy('/resumes'));
app.use('/avatars',             createPublicProxy('/avatars'));
app.use('/company-logos',       createPublicProxy('/company-logos'));
app.use('/company-backgrounds', createPublicProxy('/company-backgrounds'));

// Serve static frontend từ root (dev dùng file gốc, không dùng dist)
app.use(express.static(rootDir));

// /page -> /page.html
app.get('/:page', (req, res) => {
  const filePath = path.join(rootDir, `${req.params.page}.html`);
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  return res.status(404).send('Page not found');
});

// root
app.get('/', (_req, res) => res.sendFile(path.join(rootDir, 'index.html')));

app.listen(PORT, () => {
  console.log(`
╔═════════════════════════════════════════════════════════╗
║ 🚀 Dev Server: http://localhost:${PORT}
║ 🔁 Proxy -> ${BE}
║ ↪ /resumes
║ ↪ /avatars
║ ↪ /company-logos
║ ↪ /company-backgrounds
╚═════════════════════════════════════════════════════════╝
`);
});
